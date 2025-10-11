/**
 * 🧠 RAG KNOWLEDGE BASE SYSTEM - SUPREME INTELLIGENCE ENGINE
 * 
 * Vector database integration for perfect agent memory and knowledge retrieval
 * Transforms agents from reactive to omniscient beings with access to:
 * - Every successful campaign ever run
 * - All company documents and best practices
 * - Complete conversation history with context
 * - Industry-specific knowledge and insights
 * 
 * @version 1.0.0 - DOMINATION MODE
 */

import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { getServerSupabaseAdmin } from '@/lib/supabase';

// Initialize services
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  controllerHostUrl: process.env.PINECONE_CONTROLLER_HOST_URL
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Lazy init for Supabase
function getSupabase() {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    throw new Error('[KnowledgeBase] Supabase unavailable');
  }
  return supabase;
}

// =============================================================================
// KNOWLEDGE TYPES & INTERFACES
// =============================================================================

export interface KnowledgeDocument {
  id: string;
  type: 'campaign' | 'document' | 'conversation' | 'best_practice' | 'competitor_intel';
  agentId?: string;
  title: string;
  content: string;
  metadata: {
    source: string;
    timestamp: string;
    userId?: string;
    tags: string[];
    successMetrics?: {
      roi?: number;
      conversionRate?: number;
      engagementRate?: number;
      revenue?: number;
    };
    agentPerformance?: {
      accuracy: number;
      userSatisfaction: number;
      completionTime: number;
    };
  };
  embedding?: number[];
  relevanceScore?: number;
}

export interface KnowledgeQuery {
  query: string;
  agentId?: string;
  userId?: string;
  type?: KnowledgeDocument['type'];
  topK?: number;
  includeMetadata?: boolean;
  filters?: {
    dateRange?: {
      start: Date;
      end: Date;
    };
    minSuccessRate?: number;
    tags?: string[];
  };
}

export interface KnowledgeResponse {
  documents: KnowledgeDocument[];
  totalResults: number;
  queryTime: number;
  enhancedContext: string;
  confidenceScore: number;
}

// =============================================================================
// VECTOR DATABASE CONFIGURATION
// =============================================================================

const VECTOR_CONFIG = {
  indexName: 'skrbl-agent-knowledge',
  dimension: 3072, // text-embedding-3-large dimension
  metric: 'cosine' as const,
  podType: 'p1.x1' as const,
  replicas: 1,
  shards: 1
};

// =============================================================================
// KNOWLEDGE BASE ENGINE
// =============================================================================

export class RAGKnowledgeBase {
  private index: any;
  private initialized: boolean = false;
  private embeddingCache: Map<string, number[]> = new Map();
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize vector database connection
   */
  private async initialize(): Promise<void> {
    try {
      console.log('[RAG] Initializing knowledge base...');
      
      // Check if index exists, create if not
      const indexes = await pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(idx => idx.name === VECTOR_CONFIG.indexName);
      
      if (!indexExists) {
        console.log('[RAG] Creating new vector index...');
        await pinecone.createIndex({
          name: VECTOR_CONFIG.indexName,
          dimension: VECTOR_CONFIG.dimension,
          metric: VECTOR_CONFIG.metric,
          spec: {
            pod: {
              environment: process.env.PINECONE_ENVIRONMENT || 'gcp-starter',
              podType: VECTOR_CONFIG.podType,
              replicas: VECTOR_CONFIG.replicas,
              shards: VECTOR_CONFIG.shards,
              metadataConfig: {
                indexed: ['type', 'agentId', 'userId', 'tags']
              }
            }
          }
        });
        
        // Wait for index to be ready
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
      this.index = pinecone.index(VECTOR_CONFIG.indexName);
      this.initialized = true;
      
      console.log('[RAG] Knowledge base initialized successfully! 🧠');
      
    } catch (error) {
      console.error('[RAG] Failed to initialize knowledge base:', error);
      throw new Error('Knowledge base initialization failed');
    }
  }
  
  /**
   * Generate embeddings for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = text.substring(0, 100);
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }
    
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: text,
        dimensions: VECTOR_CONFIG.dimension
      });
      
      const embedding = response.data[0].embedding;
      
      // Cache the embedding
      this.embeddingCache.set(cacheKey, embedding);
      if (this.embeddingCache.size > 1000) {
        // Clear oldest entries if cache gets too large
        const firstEntry = this.embeddingCache.keys().next();
        if (!firstEntry.done && firstEntry.value) {
          this.embeddingCache.delete(firstEntry.value);
        }
      }
      
      return embedding;
      
    } catch (error) {
      console.error('[RAG] Embedding generation failed:', error);
      throw new Error('Failed to generate embedding');
    }
  }
  
  /**
   * Ingest knowledge into the vector database
   */
  public async ingestKnowledge(document: Omit<KnowledgeDocument, 'embedding'>): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    try {
      console.log(`[RAG] Ingesting knowledge: ${document.title}`);
      
      // Generate embedding for the document
      const contentToEmbed = `${document.title}\n${document.content}\n${document.metadata.tags.join(' ')}`;
      const embedding = await this.generateEmbedding(contentToEmbed);
      
      // Prepare vector record
      const vectorRecord: PineconeRecord = {
        id: document.id,
        values: embedding,
        metadata: {
          type: document.type,
          agentId: document.agentId || '',
          title: document.title,
          source: document.metadata.source,
          timestamp: document.metadata.timestamp,
          userId: document.metadata.userId || '',
          tags: JSON.stringify(document.metadata.tags),
          roi: document.metadata.successMetrics?.roi || 0,
          conversionRate: document.metadata.successMetrics?.conversionRate || 0,
          content: document.content.substring(0, 1000) // Store partial content in metadata
        }
      };
      // Upsert to Pinecone
      await this.index.upsert([vectorRecord]);
      
      // Also store full document in Supabase for retrieval
      const supabase = getSupabase();
      await supabase
        .from('agent_knowledge_base')
        .upsert({
          id: document.id,
          type: document.type,
          agent_id: document.agentId,
          title: document.title,
          content: document.content,
          metadata: document.metadata,
          embedding_generated: true,
          created_at: new Date().toISOString()
        });
      
      console.log(`[RAG] Knowledge ingested successfully: ${document.id}`);
      
    } catch (error) {
      console.error('[RAG] Knowledge ingestion failed:', error);
      throw error;
    }
  }
  
  /**
   * Query the knowledge base with enhanced context retrieval
   */
  public async queryKnowledge(query: KnowledgeQuery): Promise<KnowledgeResponse> {
    if (!this.initialized) await this.initialize();
    
    const startTime = Date.now();
    
    try {
      console.log(`[RAG] Querying knowledge base: "${query.query}"`);
      
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query.query);
      
      // Build filter object
      const filter: any = {};
      if (query.agentId) filter.agentId = { $eq: query.agentId };
      if (query.type) filter.type = { $eq: query.type };
      if (query.userId) filter.userId = { $eq: query.userId };
      if (query.filters?.tags?.length) {
        filter.tags = { $in: query.filters.tags };
      }
      
      // Query Pinecone
      const queryResponse = await this.index.query({
        vector: queryEmbedding,
        topK: query.topK || 5,
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      });
      
      // Retrieve full documents from Supabase
      const documentIds = queryResponse.matches.map((match: any) => match.id);
      const supabase = getSupabase();
      const { data: fullDocuments } = await supabase
        .from('agent_knowledge_base')
        .select('*')
        .in('id', documentIds);
      
      // Merge results with relevance scores
      const documents: KnowledgeDocument[] = queryResponse.matches.map((match: any) => {
        const fullDoc = fullDocuments?.find((doc: any) => doc.id === match.id);
        return {
          id: match.id,
          type: fullDoc?.type || match.metadata.type,
          agentId: fullDoc?.agent_id || match.metadata.agentId,
          title: fullDoc?.title || match.metadata.title,
          content: fullDoc?.content || match.metadata.content,
          metadata: fullDoc?.metadata || {
            source: match.metadata.source,
            timestamp: match.metadata.timestamp,
            userId: match.metadata.userId,
            tags: JSON.parse(match.metadata.tags || '[]')
          },
          relevanceScore: match.score
        };
      });
      
      // Generate enhanced context for the agent
      const enhancedContext = this.generateEnhancedContext(documents, query);
      
      // Calculate confidence score based on relevance scores
      const avgRelevance = documents.reduce((sum, doc) => sum + (doc.relevanceScore || 0), 0) / documents.length;
      const confidenceScore = Math.min(avgRelevance * 100, 95);
      
      const queryTime = Date.now() - startTime;
      
      console.log(`[RAG] Query completed in ${queryTime}ms, found ${documents.length} documents`);
      
      return {
        documents,
        totalResults: documents.length,
        queryTime,
        enhancedContext,
        confidenceScore
      };
      
    } catch (error) {
      console.error('[RAG] Knowledge query failed:', error);
      throw error;
    }
  }
  
  /**
   * Generate enhanced context from retrieved documents
   */
  private generateEnhancedContext(documents: KnowledgeDocument[], query: KnowledgeQuery): string {
    if (documents.length === 0) {
      return 'No relevant knowledge found for this query.';
    }
    
    let context = '🧠 ENHANCED KNOWLEDGE CONTEXT:\n\n';
    
    // Group by type for better organization
    const groupedDocs = documents.reduce((acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    }, {} as Record<string, KnowledgeDocument[]>);
    
    // Build context by type
    for (const [type, docs] of Object.entries(groupedDocs)) {
      context += `📁 ${type.toUpperCase().replace('_', ' ')}:\n`;
      
      docs.forEach((doc, index) => {
        context += `\n${index + 1}. ${doc.title} (Relevance: ${Math.round((doc.relevanceScore || 0) * 100)}%)\n`;
        
        // Add key insights
        if (doc.metadata.successMetrics) {
          const metrics = doc.metadata.successMetrics;
          if (metrics.roi) context += `   💰 ROI: ${metrics.roi}%\n`;
          if (metrics.conversionRate) context += `   📈 Conversion: ${metrics.conversionRate}%\n`;
          if (metrics.revenue) context += `   💵 Revenue: $${metrics.revenue.toLocaleString()}\n`;
        }
        
        // Add content snippet
        const snippet = doc.content.substring(0, 200).replace(/\n/g, ' ');
        context += `   📝 "${snippet}..."\n`;
      });
      
      context += '\n';
    }
    
    // Add summary insights
    context += '🎯 KEY INSIGHTS:\n';
    const topDoc = documents[0];
    if (topDoc.metadata.successMetrics?.roi && topDoc.metadata.successMetrics.roi > 1000) {
      context += `- Similar campaigns achieved ${topDoc.metadata.successMetrics.roi}% ROI\n`;
    }
    if (documents.some(doc => doc.type === 'best_practice')) {
      context += '- Best practices available for this scenario\n';
    }
    if (documents.some(doc => doc.type === 'competitor_intel')) {
      context += '- Competitor intelligence available for strategic advantage\n';
    }
    
    return context;
  }
  
  /**
   * Batch ingest multiple documents
   */
  public async batchIngest(documents: Omit<KnowledgeDocument, 'embedding'>[]): Promise<void> {
    console.log(`[RAG] Starting batch ingestion of ${documents.length} documents...`);
    
    const batchSize = 100;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(doc => this.ingestKnowledge(doc))
      );
      
      console.log(`[RAG] Ingested ${Math.min(i + batchSize, documents.length)}/${documents.length} documents`);
    }
    
    console.log('[RAG] Batch ingestion complete! 🎉');
  }
  
  /**
   * Update knowledge base statistics
   */
  public async getStatistics(): Promise<any> {
    if (!this.initialized) await this.initialize();
    
    try {
      const stats = await this.index.describeIndexStats();
      
      const supabase = getSupabase();
      const { count: docCount } = await supabase
        .from('agent_knowledge_base')
        .select('*', { count: 'exact', head: true });
      
      return {
        totalVectors: stats.totalRecordCount || 0,
        totalDocuments: docCount || 0,
        indexFullness: stats.indexFullness || 0,
        dimension: stats.dimension || VECTOR_CONFIG.dimension,
        namespaces: stats.namespaces || {}
      };
      
    } catch (error) {
      console.error('[RAG] Failed to get statistics:', error);
      return null;
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const ragKnowledgeBase = new RAGKnowledgeBase();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Ingest a successful campaign into the knowledge base
 */
export async function ingestSuccessfulCampaign(
  agentId: string,
  campaign: {
    title: string;
    description: string;
    results: any;
    roi: number;
    userId: string;
  }
): Promise<void> {
  const document: Omit<KnowledgeDocument, 'embedding'> = {
    id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'campaign',
    agentId,
    title: campaign.title,
    content: `${campaign.description}\n\nResults: ${JSON.stringify(campaign.results, null, 2)}`,
    metadata: {
      source: 'campaign_execution',
      timestamp: new Date().toISOString(),
      userId: campaign.userId,
      tags: ['successful_campaign', agentId, `roi_${Math.floor(campaign.roi / 1000) * 1000}`],
      successMetrics: {
        roi: campaign.roi,
        conversionRate: campaign.results.conversionRate || 0,
        revenue: campaign.results.revenue || 0
      }
    }
  };
  
  await ragKnowledgeBase.ingestKnowledge(document);
}

/**
 * Query knowledge for agent context enhancement
 */
export async function enhanceAgentContext(
  agentId: string,
  userPrompt: string,
  userId?: string
): Promise<string> {
  const response = await ragKnowledgeBase.queryKnowledge({
    query: userPrompt,
    agentId,
    userId,
    topK: 3,
    includeMetadata: true
  });
  
  return response.enhancedContext;
}

console.log('[RAG] Knowledge Base system initialized - Agents now have PERFECT MEMORY! 🧠🔥'); 