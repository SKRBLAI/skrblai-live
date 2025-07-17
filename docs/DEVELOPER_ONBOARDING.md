# SKRBL AI Platform - Developer Onboarding Guide

Welcome to the SKRBL AI development team! This guide will help you get up and running quickly with our advanced AI agent platform.

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Architecture Deep Dive](#architecture-deep-dive)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Deployment Pipeline](#deployment-pipeline)
7. [Development Workflow](#development-workflow)
8. [Testing Strategy](#testing-strategy)
9. [Performance Monitoring](#performance-monitoring)
10. [Contributing Guidelines](#contributing-guidelines)

## Platform Overview

SKRBL AI is a cutting-edge platform that orchestrates AI agents for business automation, content creation, and workflow optimization. Our platform features:

- **14 Specialized AI Agents** with unique personalities and capabilities
- **Real-time Workflow Execution** via n8n integration
- **Advanced Analytics & Monitoring** with comprehensive health checks
- **3D Interactive Components** with SSR optimization
- **Gamification System** with achievements and agent unlocks
- **Multi-tier Authentication** with VIP recognition
- **Enterprise-grade Infrastructure** with auto-scaling and monitoring

### Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **3D Graphics**: React Three Fiber, Three.js
- **Backend**: Next.js API Routes, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Workflow Engine**: n8n
- **Email**: Resend
- **SMS**: Twilio
- **Monitoring**: Custom health checking system
- **Deployment**: PM2, NGINX

## Development Environment Setup

### Prerequisites

```bash
# Required versions
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.30.0
```

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/skrbl-ai-platform.git
cd skrbl-ai-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Run database migrations
npm run db:migrate

# 5. Start development server
npm run dev
```

### Environment Variables

Create `.env.local` with the following required variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI API
OPENAI_API_KEY=your_openai_key

# n8n Integration
N8N_WEBHOOK_URL=your_n8n_webhook_url
N8N_API_KEY=your_n8n_api_key

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Resend (Email)
RESEND_API_KEY=your_resend_key
PERCY_FROM_EMAIL=percy@skrbl.ai

# Application URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Architecture Deep Dive

### Core Components

#### 1. Agent System (`/lib/agents/`)
- **Agent Registry**: Central configuration for all AI agents
- **Power Engine**: Executes agent workflows with personality injection
- **Handoff System**: Manages cross-agent collaboration
- **Workflow Lookup**: Routes requests to appropriate agents

#### 2. Backend Health System (`/lib/maintenance/`)
- **BackendHealthChecker**: Comprehensive system monitoring
- **Performance Monitoring**: Real-time metrics collection
- **Auto-healing**: Automatic issue resolution where possible

#### 3. 3D System (`/lib/3d/`)
- **Dynamic Imports**: SSR-safe Three.js component loading
- **Percy 3D Orb**: Interactive hero component with mobile fallbacks
- **Agent 3D Cards**: Hover/flip mechanics with performance optimization

#### 4. Analytics Engine (`/lib/analytics/`)
- **User Funnel Tracking**: Complete user journey analytics
- **Percy Analytics**: AI assistant interaction monitoring
- **Performance Metrics**: System health and response time tracking

### Key API Endpoints

#### Health & Monitoring
```bash
GET  /api/health                 # System health check
GET  /api/status                 # Aggregate status
GET  /api/activity/live-feed     # Real-time activity stream (SSE)
```

#### Agent Operations
```bash
GET  /api/agents/league          # Agent configuration & status
POST /api/agents/automation      # Trigger agent workflows
GET  /api/agents/chat/[agentId]  # Agent conversation
POST /api/agents/workflow/[agentId] # Advanced workflow execution
```

#### User Management
```bash
GET  /api/user/achievements      # Gamification & unlocks
POST /api/user/achievements      # Update progress
GET  /api/auth/dashboard-signin  # Authentication status
```

#### Analytics & Insights
```bash
GET  /api/analytics/dashboard    # Platform analytics
GET  /api/analytics/agents       # Agent performance metrics
POST /api/analytics/events       # Event tracking
```

## Database Schema

### Core Tables

#### Agent System
```sql
-- Agent launches and executions
CREATE TABLE agent_launches (
    id UUID PRIMARY KEY,
    agent_id VARCHAR NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    status VARCHAR NOT NULL,
    payload JSONB,
    result TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- N8N workflow executions
CREATE TABLE n8n_executions (
    id UUID PRIMARY KEY,
    workflow_id VARCHAR NOT NULL,
    execution_id VARCHAR UNIQUE NOT NULL,
    agent_id VARCHAR,
    status VARCHAR NOT NULL,
    success BOOLEAN,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### User Management
```sql
-- User achievements and gamification
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    achievement_id VARCHAR NOT NULL,
    earned_at TIMESTAMP DEFAULT NOW(),
    points_awarded INTEGER DEFAULT 0,
    claimed_at TIMESTAMP
);

-- Agent unlock system
CREATE TABLE user_agent_unlocks (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    agent_id VARCHAR NOT NULL,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);
```

#### Analytics
```sql
-- User journey tracking
CREATE TABLE user_funnel_events (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    event_type VARCHAR NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- System health logs
CREATE TABLE system_health_logs (
    id UUID PRIMARY KEY,
    overall_status VARCHAR NOT NULL,
    overall_score INTEGER,
    components JSONB,
    critical_issues JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

## Development Workflow

### Branch Strategy

```bash
# Main branches
main                    # Production-ready code
develop                 # Integration branch

# Feature branches
feature/cursor-*        # Cursor (backend) features
feature/windsurf-*      # Windsurf (frontend) features
hotfix/*               # Critical fixes
```

### Development Process

1. **Create Feature Branch**
```bash
git checkout -b feature/cursor-new-api-endpoint
```

2. **Development Guidelines**
   - Follow TypeScript strict mode
   - Write comprehensive error handling
   - Add logging for debugging
   - Include proper TypeScript types
   - Write JSDoc comments for public APIs

3. **Testing Requirements**
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test

# Build verification
npm run build
```

4. **Pull Request Process**
   - Create detailed PR description
   - Reference related issues
   - Add screenshots for UI changes
   - Ensure all CI checks pass
   - Request appropriate reviewers

### Code Standards

#### API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 1. Parse request parameters
    const { searchParams } = new URL(request.url);
    
    // 2. Authenticate user
    const authHeader = request.headers.get('authorization');
    // ... auth logic
    
    // 3. Validate input
    if (!requiredParam) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter' },
        { status: 400 }
      );
    }
    
    // 4. Execute business logic
    const result = await businessLogic();
    
    // 5. Return structured response
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('[API Route] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

#### Error Handling
```typescript
// Use structured error responses
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Log errors with context
console.error('[Component Name] Error context:', {
  userId,
  action,
  error: error.message,
  stack: error.stack
});
```

## Testing Strategy

### Unit Tests
```bash
# Test files location
tests/
├── api/                # API route tests
├── components/         # Component tests
├── lib/               # Library function tests
└── utils/             # Utility function tests
```

### Integration Tests
```typescript
// Example API test
describe('/api/agents/league', () => {
  it('should return agent list for authenticated user', async () => {
    const response = await request(app)
      .get('/api/agents/league')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.agents).toBeArray();
  });
});
```

### Health Check Tests
```bash
# Manual health verification
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health?detailed=true
curl http://localhost:3000/api/status
```

## Performance Monitoring

### Key Metrics

1. **API Response Times**
   - Target: < 500ms for most endpoints
   - Monitor via `/api/health` endpoint

2. **Database Query Performance**
   - Target: < 200ms for simple queries
   - Use query optimization and indexing

3. **3D Component Loading**
   - Lazy loading implementation
   - Mobile-first optimization
   - SSR compatibility

### Monitoring Tools

```typescript
// Built-in performance monitoring
import { performanceMonitoring } from '@/lib/systemHealth/performanceMonitoring';

// Track API performance
const startTime = Date.now();
// ... API logic
const duration = Date.now() - startTime;
await performanceMonitoring.recordAPIResponse(endpoint, duration, success);
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear build cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### 2. Database Connection Issues
```bash
# Check Supabase connection
curl -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
     "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/"
```

#### 3. 3D Component SSR Issues
```typescript
// Use dynamic imports for 3D components
const Dynamic3DComponent = dynamic(
  () => import('@/components/3d/Component'),
  { ssr: false }
);
```

#### 4. Health Check Failures
```bash
# Manual health verification
npm run health-check

# View detailed health status
curl http://localhost:3000/api/health?detailed=true
```

### Development Scripts

```bash
# Development utilities
npm run dev              # Start development server
npm run build           # Production build
npm run type-check      # TypeScript validation
npm run lint           # Code linting
npm run health-check   # System health verification
npm run db:migrate     # Run database migrations
npm run test          # Run test suite
```

## Contributing Guidelines

### Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] Proper error handling implemented
- [ ] API responses follow standard format
- [ ] Database queries are optimized
- [ ] Security considerations addressed
- [ ] Performance impact assessed
- [ ] Documentation updated
- [ ] Tests added/updated

### Security Guidelines

1. **Authentication**: Always verify user tokens
2. **Authorization**: Check user permissions for sensitive operations
3. **Input Validation**: Sanitize and validate all inputs
4. **Rate Limiting**: Implement rate limiting for public endpoints
5. **Error Messages**: Don't expose sensitive information in errors

### Performance Guidelines

1. **Database**: Use indexes, avoid N+1 queries
2. **API**: Implement caching where appropriate
3. **Frontend**: Lazy load components, optimize images
4. **Monitoring**: Add performance tracking to new features

## Getting Help

### Resources

- **API Documentation**: `/docs/API_REFERENCE.md`
- **Database Schema**: `/docs/DATABASE_SCHEMA.md`
- **Architecture Overview**: `/docs/ARCHITECTURE.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`

### Support Channels

- **Code Issues**: Create GitHub issue with detailed reproduction steps
- **Architecture Questions**: Reach out to senior developers
- **Infrastructure**: Contact DevOps team for deployment issues

### Quick Reference

```bash
# Essential commands
npm run dev                    # Start development
npm run health-check          # Verify system health
curl localhost:3000/api/health # Quick health check
npm run build                 # Production build
```

Welcome to the team! 🚀 Happy coding! 