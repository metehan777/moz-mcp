# Moz MCP Server

A Model Context Protocol (MCP) server that provides access to the comprehensive [Moz API](https://moz.com/api/docs/guides/getting-started) for SEO data and analysis. This server enables Claude and other MCP clients to access Moz's extensive SEO toolkit including keyword research, site metrics, link analysis, and competitive intelligence.

## Features

This MCP server provides access to all major Moz API endpoints, organized into the following categories:

### 🌐 Global Data
- **`moz_global_top_domains`** - Get the global top-ranking domains across the internet
- **`moz_global_top_pages`** - Get the global top-ranking pages across the internet

### 🔍 Keyword Research  
- **`moz_keyword_search_intent`** - Analyze search intent for keywords
- **`moz_keyword_suggestions`** - Get related keyword suggestions
- **`moz_keyword_difficulty`** - Get keyword difficulty scores (1-100)
- **`moz_keyword_opportunity`** - Get keyword opportunity/CTR data
- **`moz_keyword_priority`** - Get keyword priority scores
- **`moz_keyword_volume`** - Get keyword search volume data

### 🏢 Site Metrics & Analysis
- **`moz_site_brand_authority`** - Get Brand Authority scores for domains
- **`moz_site_metrics`** - Get comprehensive site metrics (DA, PA, links, etc.)
- **`moz_site_metrics_multiple`** - Get metrics for multiple sites at once
- **`moz_site_ranking_keywords`** - Get keywords a site ranks for
- **`moz_site_ranking_keywords_count`** - Count how many keywords a site ranks for

### 🔗 Link Analysis (Legacy URL-based methods)
- **`moz_url_metrics`** - Get URL metrics including Domain Authority, Page Authority
- **`moz_links`** - Get inbound links to URLs, subdomains, or domains
- **`moz_anchor_text`** - Get anchor text analysis
- **`moz_top_pages`** - Get top pages for domains
- **`moz_linking_domains`** - Get domains linking to targets

### 📊 Account & Usage
- **`moz_quota`** - Check API quota and usage limits
- **`moz_usage_data`** - Get detailed API usage statistics

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd moz-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### 1. Get Moz API Credentials

You need Moz API credentials to use this server. Get them from the [Moz API Dashboard](https://moz.com/api/docs/guides/getting-started):

1. Sign up for a Moz account at https://moz.com/
2. Go to the Moz API section 
3. Generate your API token or get your Access ID/Secret Key

### 2. Set Environment Variable

The server supports both authentication methods:

**For API Token:**
```bash
export MOZ_API_TOKEN="your_api_token_here"
```

**For Access ID/Secret Key (base64 encoded):**
```bash
export MOZ_API_TOKEN="base64_encoded_credentials"
```

### 3. Configure Claude Desktop

Add the server to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "moz": {
      "command": "node",
      "args": ["/path/to/moz-mcp/dist/index.js"],
      "env": {
        "MOZ_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Usage

Once configured, restart Claude Desktop and you can use Moz tools in your conversations:

### Keyword Research Examples
```
"What's the keyword difficulty for 'digital marketing'?"
"Get keyword suggestions for 'SEO tools'"
"What's the search volume for 'content marketing'?"
```

### Site Analysis Examples  
```
"Get site metrics for example.com"
"What's the Brand Authority of moz.com?"
"Show me the top ranking keywords for hubspot.com"
```

### Competitive Analysis Examples
```
"Get the top global domains"
"Show me who links to competitor.com"
"What are the top pages on example.com?"
```

### Link Analysis Examples
```
"Get inbound links to example.com"
"Show me anchor text analysis for this URL"
"Find linking domains to competitor.com"
```

## API Methods Reference

Based on the official [Moz API Documentation](https://moz.com/api/docs/guides/getting-started), this server implements the following JSON-RPC 2.0 methods:

| Category | Method | Description |
|----------|---------|-------------|
| **Global** | `data.globalTopDomains` | Top-ranking domains globally |
| **Global** | `data.globalTopPages` | Top-ranking pages globally |
| **Keyword** | `keyword.search_intent.fetch` | Search intent analysis |
| **Keyword** | `keyword.suggestions.list` | Related keyword suggestions |
| **Keyword** | `keyword.metrics.difficulty.fetch` | Keyword difficulty scores |
| **Keyword** | `keyword.metrics.opportunity.fetch` | Keyword opportunity data |
| **Keyword** | `keyword.metrics.priority.fetch` | Keyword priority scores |
| **Keyword** | `keyword.metrics.volume.fetch` | Search volume data |
| **Site** | `site.metrics.brand_authority.fetch` | Brand Authority scores |
| **Site** | `site.metrics.fetch` | Single site metrics |
| **Site** | `site.metrics.fetch_multiple` | Multiple site metrics |
| **Site** | `site.ranking_keywords.list` | Ranking keywords for sites |
| **Site** | `site.ranking_keywords.count` | Count of ranking keywords |
| **Legacy** | `data.urlMetrics` | URL metrics (DA, PA, etc.) |
| **Legacy** | `data.links` | Inbound link analysis |
| **Legacy** | `data.anchorText` | Anchor text analysis |
| **Legacy** | `data.topPages` | Top pages for domains |
| **Legacy** | `data.linkingDomains` | Linking domain analysis |
| **Account** | `quota.lookup` | API quota information |
| **Account** | `data.usageData` | Usage statistics |

## Development

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## Authentication

The server automatically detects your credential format:
- **API Token**: Standard x-moz-token header authentication
- **Access ID/Secret Key**: HMAC-SHA1 signature authentication with base64-encoded credentials

## Pricing & Quota

The Moz API uses a tiered pricing model with row-based quota. Different methods consume different amounts of quota. See the [Moz API pricing page](https://moz.com/api/docs/guides/getting-started#pricing-and-quota) for details.

## Error Handling

The server provides comprehensive error handling and logging:
- Validates required parameters
- Handles network errors gracefully  
- Provides detailed error messages
- Logs API request failures for debugging

## License

MIT License - see LICENSE file for details.