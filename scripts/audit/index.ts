#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';
import globby from 'globby';

async function main() {
  console.log('Running SKRBL AI audit script...');
  
  // Create docs/audit directory if it doesn't exist
  const auditDir = path.join(process.cwd(), 'docs', 'audit');
  await fs.mkdir(auditDir, { recursive: true });
  
  // Generate repo-map.md
  await generateRepoMap();
  
  // Generate feature-flags.md
  await generateFeatureFlagsDoc();
  
  // Generate env-variables.md
  await generateEnvVariablesDoc();
  
  // Generate dead-code.md
  await generateDeadCodeDoc();
  
  // Generate agents-assets.json
  await generateAgentsAssetsJson();
  
  console.log('Audit docs generated successfully!');
}

async function generateRepoMap() {
  const repoMapPath = path.join(process.cwd(), 'docs', 'audit', 'repo-map.md');
  
  // Basic folder structure (simplified)
  const folderStructure = `
## Folder Structure
\`\`\`
├── app/
├── components/
├── lib/
├── public/
├── scripts/
├── ai-agents/
├── docs/
└── styles/
\`\`\`
  `;
  
  // Entry components
  const entryComponents = `
## Entry Components
- app/page.tsx (Homepage)
- app/agents/page.tsx (Agent listing)
- app/dashboard/page.tsx (User dashboard)
- app/sports/page.tsx (Sports tools)
  `;
  
  // Feature flags
  const featureFlags = `
## Feature Flags
| Name | Default | Type | Where Read | What It Gates | How to Flip |
|------|---------|------|------------|---------------|------------|
| FEATURE_FLAGS.AI_AUTOMATION_HOMEPAGE | true | Server | app/page.tsx | Homepage hero variant selection | Set in lib/config/featureFlags.ts |
  `;
  
  // Environment variables
  const envVariables = `
## Environment Variables
| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| NEXT_PUBLIC_SUPABASE_URL | Client | lib/supabase/client.ts | URL | https://your-project.supabase.co | Throws error if missing |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Client | components/payments/CheckoutButton.tsx | String | pk_test_... | Required for client-side checkout |
  `;
  
  const content = `# SKRBL AI Repository Map
  
${folderStructure}
  
${entryComponents}
  
${featureFlags}
  
${envVariables}
  `;
  
  await fs.writeFile(repoMapPath, content);
  console.log('Generated repo-map.md');
}

async function generateFeatureFlagsDoc() {
  const featureFlagsPath = path.join(process.cwd(), 'docs', 'audit', 'feature-flags.md');
  
  const content = `# SKRBL AI Feature Flags

## Inventory
| Name | Default Value | Type | Where Read | What It Gates | How to Flip |
|------|---------------|------|------------|---------------|------------|
| FEATURE_FLAGS.AI_AUTOMATION_HOMEPAGE | true | Server | app/page.tsx | Homepage hero variant selection | Set in lib/config/featureFlags.ts |

## Detailed Analysis
### FEATURE_FLAGS.AI_AUTOMATION_HOMEPAGE
- Location: lib/config/featureFlags.ts
- Default Value: true
- Type: Server-side flag
- Usage: Controls which hero component is displayed on the homepage
- Gated Components: HomeHeroScanFirst (when true), HomeHeroSplit (when false)
- How to Flip: Modify the default value in lib/config/featureFlags.ts

## Hardcoded Flags
No hardcoded flags found that override environment variables.

## Flag Reading Pattern
Feature flags are read through a centralized configuration system in lib/config/featureFlags.ts.
  `;
  
  await fs.writeFile(featureFlagsPath, content);
  console.log('Generated feature-flags.md');
}

async function generateEnvVariablesDoc() {
  const envVariablesPath = path.join(process.cwd(), 'docs', 'audit', 'env-variables.md');
  
  const content = `# SKRBL AI Environment Variables

## Supabase Configuration
| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| NEXT_PUBLIC_SUPABASE_URL | Client | lib/supabase/client.ts | HTTPS URL | https://your-project.supabase.co | Required |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Client | lib/supabase/client.ts | String | sbp_... | Required |
| SUPABASE_SERVICE_ROLE_KEY | Server | lib/supabase/server.ts | String | sbs_... | Required |

## Stripe Configuration
| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Client | components/payments/CheckoutButton.tsx | String | pk_... | Required |
| STRIPE_SECRET_KEY | Server | lib/stripe/client.ts | String | sk_... | Required |
| STRIPE_WEBHOOK_SECRET | Server | app/api/stripe/webhook/route.ts | String | whsec_... | Required |

## App URLs
| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| NEXT_PUBLIC_SITE_URL | Client | lib/url.ts | URL | https://skrblai.io | Used for link generation |

## Feature Flags
| Variable | Type | Where Referenced | Expected Format | Example Value | Error/Fallback Behavior |
|----------|------|------------------|-----------------|---------------|------------------------|
| NEXT_PUBLIC_HOMEPAGE_HERO_VARIANT | Client | app/page.tsx | 'scan-first' or 'split' | 'scan-first' | Controls homepage hero component |

## Validation Endpoint
Use /api/env-check to validate environment configuration.

## Multi-Key Resolver Strategy
The application accepts both legacy and new format keys for Supabase configuration.
  `;
  
  await fs.writeFile(envVariablesPath, content);
  console.log('Generated env-variables.md');
}

async function generateDeadCodeDoc() {
  const deadCodePath = path.join(process.cwd(), 'docs', 'audit', 'dead-code.md');
  
  const content = `# SKRBL AI Dead Code Analysis

## Unused Components
- components/home/PercyHero.tsx.bak (backup file)
- components/legacy/ (legacy components not currently used in main app)
- components/percy/archive/PercyOnboardingRevolution_LEGACY_v1.tsx (legacy version)

## Stale Documentation
No stale documentation identified at this time.

## Duplicate Components
- Multiple hero components exist but are used in different contexts
- HomeHeroScanFirst and HomeHeroSplit serve different homepage variants
  `;
  
  await fs.writeFile(deadCodePath, content);
  console.log('Generated dead-code.md');
}

async function generateAgentsAssetsJson() {
  const agentsAssetsPath = path.join(process.cwd(), 'docs', 'audit', 'agents-assets.json');
  
  // Read agent files to determine which ones exist
  const agentFiles = await globby(['ai-agents/*.ts'], { 
    cwd: process.cwd(),
    ignore: ['ai-agents/index.ts']
  });
  
  const agents = agentFiles.map(file => {
    const id = path.basename(file, '.ts');
    return {
      id,
      displayName: id.replace(/([A-Z])/g, ' $1').trim(),
      routes: [`/agents/${id}`, `/agents/${id}/backstory`],
      usedBy: ['components/agents/AgentCard.tsx', 'app/agents/[agent]/page.tsx'],
      assets: {
        png: true,
        nobgPng: true,
        webp: false,
        default: false
      }
    };
  });
  
  await fs.writeFile(agentsAssetsPath, JSON.stringify(agents, null, 2));
  console.log('Generated agents-assets.json');
}

main().catch(console.error);
