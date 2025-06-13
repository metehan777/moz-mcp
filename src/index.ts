#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { MozApiClient, MozApiToken } from './moz-client.js';

const MOZ_API_TOKEN = process.env.MOZ_API_TOKEN;

if (!MOZ_API_TOKEN) {
  console.error('Error: MOZ_API_TOKEN environment variable is required');
  process.exit(1);
}

const token: MozApiToken = {
  apiToken: MOZ_API_TOKEN,
};

const mozClient = new MozApiClient(token);
const server = new Server(
  {
    name: 'moz-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools = [
  {
    name: 'moz_quota',
    description: 'Check your Moz API quota and usage limits',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  // V3 API Methods - Core functionality
  {
    name: 'moz_keyword_search_intent',
    description: 'Fetch search intent data for a keyword',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'The keyword to analyze',
        },
        locale: {
          type: 'string',
          description: 'Locale (defaults to en-US if not specified)',
          default: 'en-US',
        },
        engine: {
          type: 'string',
          description: 'Search engine (google, bing)',
          default: 'google',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'moz_keyword_suggestions',
    description: 'Get related keyword suggestions',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'The seed keyword',
        },
        locale: {
          type: 'string',
          description: 'Locale (defaults to en-US if not specified)',
          default: 'en-US',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of suggestions',
          default: 1000,
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'moz_keyword_difficulty',
    description: 'Fetch keyword difficulty score',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'The keyword to analyze',
        },
        locale: {
          type: 'string',
          description: 'Locale (defaults to en-US if not specified)',
          default: 'en-US',
        },
        engine: {
          type: 'string',
          description: 'Search engine',
          default: 'google',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'moz_keyword_volume',
    description: 'Fetch keyword search volume',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'The keyword to analyze',
        },
        locale: {
          type: 'string',
          description: 'Locale (defaults to en-US if not specified)',
          default: 'en-US',
        },
        engine: {
          type: 'string',
          description: 'Search engine',
          default: 'google',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'moz_keyword_metrics',
    description: 'Fetch all keyword metrics (difficulty, volume, organic CTR, priority)',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'The keyword to analyze',
        },
        locale: {
          type: 'string',
          description: 'Locale (defaults to en-US if not specified)',
          default: 'en-US',
        },
        engine: {
          type: 'string',
          description: 'Search engine',
          default: 'google',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'moz_keyword_opportunity',
    description: 'Fetch keyword opportunity (organic CTR) data',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'The keyword to analyze',
        },
        locale: {
          type: 'string',
          description: 'Locale (defaults to en-US if not specified)',
          default: 'en-US',
        },
        engine: {
          type: 'string',
          description: 'Search engine',
          default: 'google',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'moz_keyword_priority',
    description: 'Fetch keyword priority score',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: 'The keyword to analyze',
        },
        locale: {
          type: 'string',
          description: 'Locale (defaults to en-US if not specified)',
          default: 'en-US',
        },
        engine: {
          type: 'string',
          description: 'Search engine',
          default: 'google',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'moz_site_brand_authority',
    description: 'Fetch Brand Authority for a site',
    inputSchema: {
      type: 'object',
      properties: {
        site: {
          type: 'string',
          description: 'The site domain to analyze',
        },
      },
      required: ['site'],
    },
  },
  {
    name: 'moz_site_metrics',
    description: 'Fetch metrics for a single site',
    inputSchema: {
      type: 'object',
      properties: {
        site: {
          type: 'string',
          description: 'The site domain to analyze',
        },
      },
      required: ['site'],
    },
  },
  {
    name: 'moz_site_metrics_multiple',
    description: 'Fetch metrics for multiple sites at once',
    inputSchema: {
      type: 'object',
      properties: {
        sites: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of site domains to analyze',
        },
      },
      required: ['sites'],
    },
  },
  {
    name: 'moz_site_ranking_keywords',
    description: 'List ranking keywords for a site',
    inputSchema: {
      type: 'object',
      properties: {
        site: {
          type: 'string',
          description: 'The site domain to analyze',
        },
        engine: {
          type: 'string',
          description: 'Search engine',
          default: 'google',
        },
        locale: {
          type: 'string',
          description: 'Locale (defaults to en-US if not specified)',
          default: 'en-US',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of keywords to return',
          default: 100,
        },
      },
      required: ['site'],
    },
  },
  {
    name: 'moz_competitor_analysis',
    description: 'Comprehensive competitor analysis by combining site metrics, ranking keywords, and providing competitor identification guidance. Note: Moz API does not automatically identify competitors, but this tool helps analyze potential competitors you specify.',
    inputSchema: {
      type: 'object',
      properties: {
        primary_site: {
          type: 'string',
          description: 'The main site to analyze',
        },
        competitor_sites: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of competitor domains to compare against (you need to specify these)',
          default: [],
        },
        target_keyword: {
          type: 'string',
          description: 'Primary keyword/topic to focus the analysis on',
        },
        locale: {
          type: 'string',
          description: 'Locale (defaults to en-US if not specified)',
          default: 'en-US',
        },
        include_keyword_analysis: {
          type: 'boolean',
          description: 'Whether to include keyword difficulty and volume analysis for the target keyword',
          default: true,
        },
      },
      required: ['primary_site', 'target_keyword'],
    },
  },
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'moz_quota': {
        const result = await mozClient.getQuota();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      // V3 API Methods - Core functionality
      case 'moz_keyword_search_intent': {
        if (!args || !args.keyword) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: keyword'
          );
        }
        const result = await mozClient.getKeywordSearchIntent(
          args.keyword as string,
          {
            locale: args.locale as string | undefined,
            engine: args.engine as string | undefined,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_keyword_suggestions': {
        if (!args || !args.keyword) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: keyword'
          );
        }
        const result = await mozClient.getKeywordSuggestions(
          args.keyword as string,
          {
            locale: args.locale as string | undefined,
            limit: args.limit as number | undefined,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_keyword_difficulty': {
        if (!args || !args.keyword) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: keyword'
          );
        }
        const result = await mozClient.getKeywordDifficulty(
          args.keyword as string,
          {
            locale: args.locale as string | undefined,
            engine: args.engine as string | undefined,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_keyword_volume': {
        if (!args || !args.keyword) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: keyword'
          );
        }
        const result = await mozClient.getKeywordVolume(
          args.keyword as string,
          {
            locale: args.locale as string | undefined,
            engine: args.engine as string | undefined,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_keyword_metrics': {
        if (!args || !args.keyword) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: keyword'
          );
        }
        const result = await mozClient.getKeywordMetrics(
          args.keyword as string,
          {
            locale: args.locale as string | undefined,
            engine: args.engine as string | undefined,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_keyword_opportunity': {
        if (!args || !args.keyword) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: keyword'
          );
        }
        const result = await mozClient.getKeywordOpportunity(
          args.keyword as string,
          {
            locale: args.locale as string | undefined,
            engine: args.engine as string | undefined,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_keyword_priority': {
        if (!args || !args.keyword) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: keyword'
          );
        }
        const result = await mozClient.getKeywordPriority(
          args.keyword as string,
          {
            locale: args.locale as string | undefined,
            engine: args.engine as string | undefined,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_site_brand_authority': {
        if (!args || !args.site) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: site'
          );
        }
        const result = await mozClient.getSiteBrandAuthority(args.site as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_site_metrics': {
        if (!args || !args.site) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: site'
          );
        }
        const result = await mozClient.getSiteMetrics(args.site as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_site_metrics_multiple': {
        if (!args || !args.sites) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: sites'
          );
        }
        const result = await mozClient.getSiteMetricsMultiple(args.sites as string[]);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_site_ranking_keywords': {
        if (!args || !args.site) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameter: site'
          );
        }
        const result = await mozClient.getSiteRankingKeywords(
          args.site as string,
          {
            engine: args.engine as string | undefined,
            locale: args.locale as string | undefined,
            limit: args.limit as number | undefined,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'moz_competitor_analysis': {
        if (!args || !args.primary_site || !args.target_keyword) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Missing required parameters: primary_site, target_keyword'
          );
        }
        const result = await mozClient.getCompetitorAnalysis(
          args.primary_site as string,
          args.competitor_sites as string[],
          args.target_keyword as string,
          {
            locale: args.locale as string | undefined,
            include_keyword_analysis: args.include_keyword_analysis as boolean | undefined,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Moz MCP server running on stdio');
    
    // Keep the process alive with proper signal handling
    process.on('SIGINT', () => {
      console.error('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error in main:', error);
  process.exit(1);
});