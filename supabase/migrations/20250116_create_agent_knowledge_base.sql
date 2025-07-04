-- =====================================================
-- AGENT KNOWLEDGE BASE TABLE - SUPREME INTELLIGENCE
-- =====================================================
-- Stores full documents with metadata for RAG retrieval
-- Vectors are stored in Pinecone, this is for full content

CREATE TABLE IF NOT EXISTS agent_knowledge_base (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('campaign', 'document', 'conversation', 'best_practice', 'competitor_intel')),
  agent_id TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  embedding_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Indexes for efficient querying
  INDEX idx_agent_knowledge_type (type),
  INDEX idx_agent_knowledge_agent_id (agent_id),
  INDEX idx_agent_knowledge_created_at (created_at DESC),
  INDEX idx_agent_knowledge_embedding_status (embedding_generated)
);

-- Enable Row Level Security
ALTER TABLE agent_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Service role can manage all knowledge" ON agent_knowledge_base
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read knowledge" ON agent_knowledge_base
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_agent_knowledge_base_updated_at
  BEFORE UPDATE ON agent_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for knowledge base statistics
CREATE OR REPLACE VIEW agent_knowledge_stats AS
SELECT 
  type,
  agent_id,
  COUNT(*) as document_count,
  COUNT(CASE WHEN embedding_generated THEN 1 END) as embedded_count,
  MAX(created_at) as latest_document,
  MIN(created_at) as oldest_document
FROM agent_knowledge_base
GROUP BY type, agent_id;

-- Grant permissions
GRANT ALL ON agent_knowledge_base TO service_role;
GRANT SELECT ON agent_knowledge_base TO authenticated;
GRANT SELECT ON agent_knowledge_stats TO authenticated;

-- Insert initial best practices
INSERT INTO agent_knowledge_base (id, type, title, content, metadata) VALUES
(
  'best_practice_001',
  'best_practice',
  'High-Converting Email Campaign Structure',
  'Subject Line: Create urgency with numbers and time limits. Example: "Only 48 hours left: 50% off for first 100 customers"
  
  Body Structure:
  1. Hook: Address pain point immediately
  2. Story: Share relatable customer success
  3. Benefits: List 3-5 specific outcomes
  4. Social Proof: Include testimonials
  5. CTA: Clear, action-oriented button
  
  Best Practices:
  - Keep subject lines under 50 characters
  - Use personalization tokens
  - Mobile-optimize all content
  - A/B test subject lines
  - Send Tuesday-Thursday, 10am-2pm',
  '{
    "tags": ["email_marketing", "conversion_optimization", "best_practice"],
    "source": "industry_research",
    "timestamp": "2025-01-16T00:00:00Z",
    "successMetrics": {
      "conversionRate": 24.5,
      "engagementRate": 67.8
    }
  }'
),
(
  'best_practice_002',
  'best_practice',
  'Social Media Viral Content Formula',
  'The VIRAL Framework:
  
  V - Visual Hook: First 3 seconds must stop scroll
  I - Immediate Value: Promise clear benefit upfront
  R - Relatable Story: Connect emotionally
  A - Action Trigger: Clear next step
  L - Loop or Share: Encourage resharing
  
  Platform-Specific Tips:
  - Instagram: Square videos, 30-60 seconds
  - TikTok: Vertical, trending audio, 15-30 seconds
  - LinkedIn: Professional tone, 1-2 minutes
  - Twitter/X: Thread format, controversial takes
  
  Optimal Posting Times:
  - Instagram: 11am-1pm, 7-9pm
  - TikTok: 9-10am, 7-9pm
  - LinkedIn: Tuesday-Thursday, 8-10am
  - Twitter/X: 9-10am, 7-9pm',
  '{
    "tags": ["social_media", "viral_content", "engagement", "best_practice"],
    "source": "platform_analytics",
    "timestamp": "2025-01-16T00:00:00Z",
    "successMetrics": {
      "engagementRate": 487,
      "roi": 2847
    }
  }'
); 