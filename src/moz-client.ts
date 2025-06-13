import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface MozApiToken {
  apiToken: string;
}

export interface JsonRpcRequest {
  jsonrpc: string;
  id: string;
  method: string;
  params: any;
}

export interface JsonRpcResponse {
  jsonrpc: string;
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class MozApiClient {
  private apiToken: string;
  private accessId?: string;
  private secretKey?: string;
  private baseUrl: string = 'https://api.moz.com/jsonrpc';
  private axiosInstance: AxiosInstance;

  constructor(token: MozApiToken) {
    this.apiToken = token.apiToken;
    
    // Check if token is base64 encoded credentials (V2 format)
    try {
      const decoded = Buffer.from(this.apiToken, 'base64').toString('utf-8');
      if (decoded.includes(':')) {
        const [accessId, secretKey] = decoded.split(':');
        this.accessId = accessId;
        this.secretKey = secretKey;
        console.error('Using Access ID/Secret Key authentication (V2)');
      } else {
        console.error('Using API token authentication (V3)');
      }
    } catch (error) {
      console.error('Using API token authentication (V3)');
    }
    
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private createAuthSignature(timestamp: number): string {
    if (!this.accessId || !this.secretKey) {
      throw new Error('Access ID and Secret Key required for signature authentication');
    }
    
    const stringToSign = `${this.accessId}\n${timestamp}`;
    const signature = crypto
      .createHmac('sha1', this.secretKey)
      .update(stringToSign)
      .digest('base64');
    
    return signature;
  }

  private getAuthHeaders(): Record<string, string> {
    // For V3 API, try simple token authentication first
    if (!this.accessId || !this.secretKey) {
      // Use the raw token for V3 authentication
      return {
        'x-moz-token': this.apiToken,
      };
    } else {
      // If we have V2 credentials, try the raw base64 token first for V3
      return {
        'x-moz-token': this.apiToken,
      };
    }
  }

  private createRequest(method: string, params: any): JsonRpcRequest {
    return {
      jsonrpc: '2.0',
      id: uuidv4(),
      method,
      params,
    };
  }

  private async sendRequest(request: JsonRpcRequest): Promise<any> {
    try {
      const authHeaders = this.getAuthHeaders();
      const response = await this.axiosInstance.post('', request, {
        headers: authHeaders,
      });
      const data = response.data as JsonRpcResponse;
      
      if (data.error) {
        throw new Error(`Moz API Error: ${data.error.message} (Code: ${data.error.code})`);
      }
      
      return data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Request failed:', error.response?.status, error.response?.data);
        throw new Error(`Network Error: ${error.message} - ${error.response?.data ? JSON.stringify(error.response.data) : 'No response data'}`);
      }
      throw error;
    }
  }

  // Core working methods based on official Moz API V3 documentation
  async getQuota(): Promise<any> {
    const request = this.createRequest('quota.lookup', {
      data: {
        path: 'api.limits.data.rows',
      },
    });
    return this.sendRequest(request);
  }

  // Keyword Methods
  async getKeywordSearchIntent(keyword: string, options?: {
    locale?: string;
    engine?: string;
  }): Promise<any> {
    const request = this.createRequest('data.keyword.search.intent.fetch', {
      data: {
        serp_query: {
          keyword,
          locale: options?.locale || 'en-US',
          device: 'desktop',
          engine: options?.engine || 'google',
        },
      },
    });
    return this.sendRequest(request);
  }

  async getKeywordSuggestions(keyword: string, options?: {
    locale?: string;
    limit?: number;
  }): Promise<any> {
    const request = this.createRequest('data.keyword.suggestions.list', {
      data: {
        serp_query: {
          keyword,
          locale: options?.locale || 'en-US',
          device: 'desktop',
          engine: 'google',
        },
      },
    });
    return this.sendRequest(request);
  }

  async getKeywordDifficulty(keyword: string, options?: {
    locale?: string;
    engine?: string;
  }): Promise<any> {
    const request = this.createRequest('data.keyword.metrics.difficulty.fetch', {
      data: {
        serp_query: {
          keyword,
          locale: options?.locale || 'en-US',
          device: 'desktop',
          engine: options?.engine || 'google',
        },
      },
    });
    return this.sendRequest(request);
  }

  async getKeywordVolume(keyword: string, options?: {
    locale?: string;
    engine?: string;
  }): Promise<any> {
    const request = this.createRequest('data.keyword.metrics.volume.fetch', {
      data: {
        serp_query: {
          keyword,
          locale: options?.locale || 'en-US',
          device: 'desktop',
          engine: options?.engine || 'google',
        },
      },
    });
    return this.sendRequest(request);
  }

  async getKeywordMetrics(keyword: string, options?: {
    locale?: string;
    engine?: string;
  }): Promise<any> {
    const request = this.createRequest('data.keyword.metrics.fetch', {
      data: {
        serp_query: {
          keyword,
          locale: options?.locale || 'en-US',
          device: 'desktop',
          engine: options?.engine || 'google',
        },
      },
    });
    return this.sendRequest(request);
  }

  async getKeywordOpportunity(keyword: string, options?: {
    locale?: string;
    engine?: string;
  }): Promise<any> {
    const request = this.createRequest('data.keyword.metrics.opportunity.fetch', {
      data: {
        serp_query: {
          keyword,
          locale: options?.locale || 'en-US',
          device: 'desktop',
          engine: options?.engine || 'google',
        },
      },
    });
    return this.sendRequest(request);
  }

  async getKeywordPriority(keyword: string, options?: {
    locale?: string;
    engine?: string;
  }): Promise<any> {
    const request = this.createRequest('data.keyword.metrics.priority.fetch', {
      data: {
        serp_query: {
          keyword,
          locale: options?.locale || 'en-US',
          device: 'desktop',
          engine: options?.engine || 'google',
        },
      },
    });
    return this.sendRequest(request);
  }

  // Site Metrics Methods
  async getSiteBrandAuthority(site: string): Promise<any> {
    const request = this.createRequest('data.site.metrics.brand.authority.fetch', {
      data: {
        site_query: {
          query: site,
          scope: 'domain',
        },
      },
    });
    return this.sendRequest(request);
  }

  async getSiteMetrics(site: string): Promise<any> {
    const request = this.createRequest('data.site.metrics.fetch', {
      data: {
        site_query: {
          query: site,
          scope: 'domain',
        },
      },
    });
    return this.sendRequest(request);
  }

  async getSiteRankingKeywords(site: string, options?: {
    engine?: string;
    locale?: string;
    limit?: number;
  }): Promise<any> {
    const request = this.createRequest('data.site.ranking.keywords.list', {
      data: {
        target_query: {
          query: site,
          scope: 'domain',
          locale: options?.locale || 'en-US',
        },
        serp_query: {
          engine: options?.engine || 'google',
          locale: options?.locale || 'en-US',
        },
        limit: options?.limit || 100,
      },
    });
    return this.sendRequest(request);
  }

  async getUrlMetrics(targets: string[], options?: { 
    metrics?: string[],
    scope?: 'page' | 'subdomain' | 'root_domain' 
  }): Promise<any> {
    const request = this.createRequest('data.url_metrics', {
      data: {
        targets,
        ...(options?.scope && { scope: options.scope }),
        ...(options?.metrics && { metrics: options.metrics }),
      },
    });
    return this.sendRequest(request);
  }

  async getLinks(target: string, options?: {
    scope?: 'page' | 'subdomain' | 'root_domain';
    sort?: string;
    filter?: string;
    limit?: number;
    sourceScope?: 'page' | 'subdomain' | 'root_domain';
  }): Promise<any> {
    const request = this.createRequest('data.links', {
      data: {
        target,
        scope: options?.scope || 'page',
        limit: options?.limit || 50,
        ...(options?.sort && { sort: options.sort }),
        ...(options?.filter && { filter: options.filter }),
        ...(options?.sourceScope && { source_scope: options.sourceScope }),
      },
    });
    return this.sendRequest(request);
  }

  async getAnchorText(target: string, options?: {
    scope?: 'page' | 'subdomain' | 'root_domain';
    sort?: string;
    limit?: number;
  }): Promise<any> {
    const request = this.createRequest('data.anchor_text', {
      data: {
        target,
        scope: options?.scope || 'page',
        limit: options?.limit || 50,
        ...(options?.sort && { sort: options.sort }),
      },
    });
    return this.sendRequest(request);
  }

  async getTopPages(target: string, options?: {
    scope?: 'subdomain' | 'root_domain';
    sort?: string;
    limit?: number;
  }): Promise<any> {
    const request = this.createRequest('data.top_pages', {
      data: {
        target,
        scope: options?.scope || 'root_domain',
        limit: options?.limit || 50,
        ...(options?.sort && { sort: options.sort }),
      },
    });
    return this.sendRequest(request);
  }

  async getLinkingDomains(target: string, options?: {
    scope?: 'page' | 'subdomain' | 'root_domain';
    sort?: string;
    filter?: string;
    limit?: number;
  }): Promise<any> {
    const request = this.createRequest('data.linking_domains', {
      data: {
        target,
        scope: options?.scope || 'page',
        limit: options?.limit || 50,
        ...(options?.sort && { sort: options.sort }),
        ...(options?.filter && { filter: options.filter }),
      },
    });
    return this.sendRequest(request);
  }

  async getGlobalTopPages(options?: {
    limit?: number;
  }): Promise<any> {
    const request = this.createRequest('data.global.top.pages.list', {
      data: {
        limit: options?.limit || 100,
      },
    });
    return this.sendRequest(request);
  }

  async getGlobalTopDomains(options?: {
    limit?: number;
  }): Promise<any> {
    const request = this.createRequest('data.global.top.domains.list', {
      data: {
        limit: options?.limit || 100,
      },
    });
    return this.sendRequest(request);
  }

  async getUsageData(options?: {
    start?: string;
    end?: string;
  }): Promise<any> {
    const request = this.createRequest('data.usage', {
      data: {
        ...(options?.start && { start: options.start }),
        ...(options?.end && { end: options.end }),
      },
    });
    return this.sendRequest(request);
  }

  async getSiteMetricsMultiple(sites: string[]): Promise<any> {
    const request = this.createRequest('data.site.metrics.fetch.multiple', {
      data: {
        site_queries: sites.map(site => ({
          query: site,
          scope: 'domain',
        })),
      },
    });
    return this.sendRequest(request);
  }

  async getSiteRankingKeywordsCount(site: string, options?: {
    engine?: string;
    locale?: string;
  }): Promise<any> {
    const request = this.createRequest('site.ranking_keywords.count', {
      data: {
        site,
        engine: options?.engine || 'google',
        locale: options?.locale || 'en-US',
      },
    });
    return this.sendRequest(request);
  }

  // Comprehensive competitor analysis method
  async getCompetitorAnalysis(
    primarySite: string,
    competitorSites: string[] = [],
    targetKeyword: string,
    options?: {
      locale?: string;
      include_keyword_analysis?: boolean;
    }
  ): Promise<any> {
    const locale = options?.locale || 'en-US';
    const includeKeywordAnalysis = options?.include_keyword_analysis !== false;
    
    try {
      // Initialize results object
      const analysis: any = {
        primary_site: primarySite,
        target_keyword: targetKeyword,
        locale: locale,
        analysis_timestamp: new Date().toISOString(),
        primary_site_data: {},
        competitor_data: [],
        keyword_analysis: {},
        insights: [],
      };

      // 1. Get primary site data
      console.error(`Analyzing primary site: ${primarySite}`);
      const primarySitePromises = [
        this.getSiteMetrics(primarySite).catch(e => ({ error: e.message })),
        this.getSiteBrandAuthority(primarySite).catch(e => ({ error: e.message })),
        this.getSiteRankingKeywords(primarySite, { locale, limit: 100 }).catch(e => ({ error: e.message }))
      ];

      const [primaryMetrics, primaryBrandAuth, primaryKeywords] = await Promise.all(primarySitePromises);
      
      analysis.primary_site_data = {
        site_metrics: primaryMetrics,
        brand_authority: primaryBrandAuth,
        ranking_keywords: primaryKeywords,
      };

      // 2. Get competitor data if provided
      if (competitorSites.length > 0) {
        console.error(`Analyzing ${competitorSites.length} competitors`);
        
        for (const competitor of competitorSites) {
          try {
            const competitorPromises = [
              this.getSiteMetrics(competitor).catch(e => ({ error: e.message })),
              this.getSiteBrandAuthority(competitor).catch(e => ({ error: e.message })),
              this.getSiteRankingKeywords(competitor, { locale, limit: 100 }).catch(e => ({ error: e.message }))
            ];

            const [compMetrics, compBrandAuth, compKeywords] = await Promise.all(competitorPromises);
            
            analysis.competitor_data.push({
              site: competitor,
              site_metrics: compMetrics,
              brand_authority: compBrandAuth,
              ranking_keywords: compKeywords,
            });
          } catch (error) {
            analysis.competitor_data.push({
              site: competitor,
              error: `Failed to analyze: ${error}`,
            });
          }
        }
      }

      // 3. Get keyword analysis if requested
      if (includeKeywordAnalysis) {
        console.error(`Analyzing target keyword: ${targetKeyword}`);
        const keywordPromises = [
          this.getKeywordMetrics(targetKeyword, { locale }).catch(e => ({ error: e.message })),
          this.getKeywordDifficulty(targetKeyword, { locale }).catch(e => ({ error: e.message })),
          this.getKeywordVolume(targetKeyword, { locale }).catch(e => ({ error: e.message })),
          this.getKeywordSearchIntent(targetKeyword, { locale }).catch(e => ({ error: e.message }))
        ];

        const [keywordMetrics, keywordDifficulty, keywordVolume, keywordIntent] = await Promise.all(keywordPromises);
        
        analysis.keyword_analysis = {
          keyword: targetKeyword,
          metrics: keywordMetrics,
          difficulty: keywordDifficulty,
          volume: keywordVolume,
          search_intent: keywordIntent,
        };
      }

      // 4. Generate insights
      analysis.insights = this.generateCompetitorInsights(analysis);

      // 5. Add guidance if no competitors provided
      if (competitorSites.length === 0) {
        analysis.competitor_identification_guidance = {
          message: "No competitors were specified. To find potential competitors, you can:",
          suggestions: [
            "1. Look at the ranking keywords data above and see which sites rank for similar keywords",
            "2. Search for your target keyword in Google and see which sites appear in top results",
            "3. Use industry knowledge to identify known competitors",
            "4. Once you identify potential competitors, run this analysis again with competitor_sites parameter"
          ],
          note: "Moz API does not automatically identify competitors - you need to specify them manually"
        };
      }

      return analysis;
    } catch (error) {
      throw new Error(`Competitor analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private generateCompetitorInsights(analysis: any): string[] {
    const insights: string[] = [];
    
    try {
      // Primary site insights
      if (analysis.primary_site_data?.brand_authority?.result) {
        const ba = analysis.primary_site_data.brand_authority.result.brand_authority;
        if (ba) {
          insights.push(`Primary site brand authority: ${ba} (${ba >= 70 ? 'Excellent' : ba >= 50 ? 'Good' : ba >= 30 ? 'Fair' : 'Needs improvement'})`);
        }
      }

      // Keyword insights
      if (analysis.keyword_analysis?.difficulty?.result) {
        const difficulty = analysis.keyword_analysis.difficulty.result.difficulty;
        if (difficulty) {
          insights.push(`Target keyword "${analysis.target_keyword}" difficulty: ${difficulty}% (${difficulty >= 70 ? 'Very Hard' : difficulty >= 50 ? 'Hard' : difficulty >= 30 ? 'Medium' : 'Easy'})`);
        }
      }

      if (analysis.keyword_analysis?.volume?.result) {
        const volume = analysis.keyword_analysis.volume.result.volume;
        if (volume) {
          insights.push(`Target keyword monthly search volume: ${volume.toLocaleString()}`);
        }
      }

      // Competitor comparison insights
      if (analysis.competitor_data.length > 0) {
        let strongerCompetitors = 0;
        let weakerCompetitors = 0;
        
        const primaryBA = analysis.primary_site_data?.brand_authority?.result?.brand_authority;
        
        analysis.competitor_data.forEach((comp: any) => {
          const compBA = comp.brand_authority?.result?.brand_authority;
          if (primaryBA && compBA) {
            if (compBA > primaryBA) strongerCompetitors++;
            else if (compBA < primaryBA) weakerCompetitors++;
          }
        });

        if (strongerCompetitors > 0 || weakerCompetitors > 0) {
          insights.push(`Competitive landscape: ${strongerCompetitors} competitors have higher brand authority, ${weakerCompetitors} have lower`);
        }
      }

      // Ranking keywords insights
      if (analysis.primary_site_data?.ranking_keywords?.result) {
        const keywords = analysis.primary_site_data.ranking_keywords.result;
        if (keywords && keywords.length) {
          insights.push(`Primary site ranks for ${keywords.length} keywords (showing up to 100)`);
          
          // Look for target keyword in ranking keywords
          const targetFound = keywords.find((kw: any) => 
            kw.keyword && kw.keyword.toLowerCase().includes(analysis.target_keyword.toLowerCase())
          );
          
          if (targetFound) {
            insights.push(`Primary site ranks for target keyword "${analysis.target_keyword}" at position ${targetFound.rank || 'unknown'}`);
          } else {
            insights.push(`Primary site does not appear to rank in top 100 for target keyword "${analysis.target_keyword}"`);
          }
        }
      }

    } catch (error) {
      insights.push(`Note: Some insights could not be generated due to data analysis issues`);
    }

    return insights;
  }
}