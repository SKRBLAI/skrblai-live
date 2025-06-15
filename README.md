# SKRBL AI Platform

## Project Overview

SKRBL AI is a cutting-edge platform that offers AI-powered agents for content creation, branding, social media management, and business automation. The platform features a variety of specialized agents, each designed to tackle specific creative and business tasks.

## 🚀 Development Status

This document tracks the ongoing development, refactoring, and enhancement efforts for the SKRBL AI platform. The information is organized into three categories:
- ✅ **Completed** - Changes that have been successfully implemented
- 🔄 **In Progress** - Work that is currently underway
- 📋 **Planned** - Tasks identified for future implementation

## ✅ Completed Changes

### Agent Component Standardization (May 2025)
- Created dedicated agent backstory pages at `/agent-backstory/[agentId]`
- Standardized all agent components to use consistent props and routing
- Updated all "Info"/"Details" buttons to route to `/agent-backstory/[agentId]`
- Ensured all components use `agentBackstories.ts` as the single source of truth
- Standardized action naming with `onInfo`, `onChat`, `onHandoff`, and `onLaunch`
- Removed modal-based backstory display for better UX and SEO
- Added comprehensive documentation in `docs/AGENT_COMPONENTS_STANDARDIZATION.md`

### Image Path Standardization (May 2025)
- Standardized agent image paths across the entire platform
- Consolidated all agent images to follow the format: `/images/agents-{slug}-skrblai.png`
- Removed legacy `avatarVariant` property from Agent interface
- Updated `getAgentImagePath` utility to handle standardized paths
- Modified API routes to use consistent image path formats
- Ensured consistent fallback images (`/images/{gender}-silhouette.png`)
- Updated all component references to use the standardized paths

### Analytics Dashboard Implementation (April 2025)
- Created a dedicated analytics dashboard at `/dashboard/analytics`
- Implemented real-time data updates via Supabase subscriptions
- Refactored `usePercyAnalytics` hook to use actual data instead of mock data
- Enhanced `AgentStatsPanel` component with loading and empty states
- Added time range filtering for analytics data
- Integrated interactive charts for visual data representation

### Dashboard Sidebar Enhancement (April 2025)
- Updated `DashboardSidebar` component to use Next.js Link for navigation
- Fixed ARIA role accessibility issues
- Implemented active state detection for better user experience
- Added visual indicators for the currently selected section

### Dashboard Cleanup (April 2025)
- Migrated UI logic from `/app/user-dashboard/` to `/components/dashboard/`
- Centralized dashboard components for better maintainability
- Standardized dashboard layout and styling

## 🔄 In Progress

### Percy AI Assistant Refinement
- Improving conversation flow and context retention
- Enhancing Percy's ability to recommend appropriate agents based on user input
- Implementing better fallback mechanisms when Percy cannot understand user intent
- Synchronizing Percy Widget and Percy AI Concierge to avoid duplication

### User Onboarding Flow Enhancement
- Streamlining the initial user experience
- Creating more intuitive guidance for new users
- Implementing personalized onboarding paths based on user goals
- Adding interactive tutorials for key platform features

### Workflow System Improvements
- Refining the multi-agent workflow execution
- Enhancing workflow templates with more use cases
- Improving error handling and recovery in workflows
- Adding workflow progress visualization

## 📋 Planned Changes

### Component Library Standardization
- Create a unified component library with consistent styling
- Document component usage guidelines and props
- Implement storybook for visual component documentation
- Ensure accessibility compliance across all components

### Performance Optimization
- Implement code splitting for faster initial load times
- Optimize image loading and display
- Enhance API response caching
- Improve client-side state management

### Agent Capability Expansion
- Add more specialized agents for niche industries
- Enhance existing agents with more capabilities
- Implement agent combination for complex tasks
- Add user feedback loop to improve agent performance over time

## 🧠 Project Architecture

### Key Directories

- `/app` - Next.js app directory with pages and layouts
- `/components` - React components organized by feature/function
- `/utils` - Utility functions and helpers
- `/styles` - Global styles and CSS modules
- `/lib` - Core library code, including agent definitions
- `/ai-agents` - Individual agent implementation files
- `/public` - Static assets including images
- `/contexts` - React context providers for global state
- `/types` - TypeScript type definitions

### Agent System

Agents are the core of the SKRBL AI platform. Each agent:
- Has a specific focus area (content, branding, social media, etc.)
- Implements a standard interface defined in `/types/agent.ts`
- Has standardized imagery and branding
- Can be combined into workflows for complex tasks

## 🧪 Development Guidelines

### Image Naming Convention
- Agent images: `/images/agents-{slug}-skrblai.png`
- Fallback images: `/images/{gender}-silhouette.png`
- Feature images: `/images/{feature-name}.jpg/png`

### Component Creation Guidelines
- Create new components in the appropriate subdirectory under `/components`
- Use TypeScript for all new components
- Implement proper accessibility attributes
- Include responsive design considerations
- Prefer functional components with hooks over class components

### Styling Approach
- Use Tailwind CSS for styling
- Leverage CSS variables for theme colors defined in global.css
- Use consistent naming for custom classes
- Follow the established aesthetic with futuristic, cosmic UI elements

## 🛠️ Development Tools

- Visual Studio Code / Cursor / Windsurf (IDEs)
- Next.js (React framework)
- TypeScript (Type safety)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Supabase (Backend services)
- OpenAI API (AI functionality)

## 📚 Additional Documentation

- `/components/dashboard/README_DASHBOARD_CLEANUP.md` - Details about dashboard component migration

## 👩‍💻 Engineer's Guide: Cross-IDE Development Notes

### Technical Architecture

#### Next.js App Router Structure
- The project uses Next.js App Router (not Pages Router)
- Page components are in `/app/**` directories
- `layout.tsx` controls the global structure
- Component-level page wrappers are in `/components/layout`

#### State Management
- Context-based state management is used extensively with React Context API
- Key contexts:
  - `PercyContext` - Manages Percy AI assistant state
  - `AuthContext` - Handles authentication state
- Local component state uses React hooks (`useState`, `useReducer`)
- No Redux or other global state libraries are used

#### Data Fetching Pattern
- API routes in `/app/api/**` handle server-side logic
- Client components use custom hooks for data fetching
- Supabase real-time subscriptions are used for live data updates
- Pattern: initialize subscriptions in `useEffect`, clean up on unmount

### Common Issues & Gotchas

#### Image Path Handling
- Always use the standardized image path format
- Never hardcode old `/avatars/...` paths
- Use `getAgentImagePath()` utility for consistency
- Handle image errors with fallbacks to silhouette images

#### Percy Component Duplication
- Avoid duplicating Percy functionality across different components
- `PercyChat`, `PercyWidget`, and `PercyHero` may look similar but serve different purposes
- Check for existing Percy implementations before creating new ones

#### Framer Motion Animations
- Framer Motion animations may behave differently across browsers
- Always include fallbacks for reduced motion preferences
- Animation variants are defined at the component level for consistency
- Testing required on multiple devices/browsers for animation performance

#### Tailwind Classes Organization
- Long Tailwind class strings should be organized with similar properties grouped
- Consider extracting very complex styles to component classes in `styles/components.css`
- Use the `className` prop consistently (not style prop) for styling

### IDE-Specific Notes

#### VS Code
- Recommended extensions:
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - ESLint
  - Prettier
- Settings sync is available in the `.vscode` directory

#### Cursor
- Cursor-specific AI assistance works well with the codebase
- Use Cursor's AI to help navigate between related components
- Code completion works especially well with Tailwind classes

#### Windsurf
- Component visualization features are helpful for the UI-heavy parts
- Import path aliasing (@/ paths) may need manual configuration

### Testing Approach

- Component testing uses React Testing Library
- End-to-end testing with Playwright
- Manual testing checklist available for critical user flows
- Accessibility testing with axe-core

### Performance Considerations

- Large component optimization:
  - Use `React.lazy` and dynamic imports for modal components
  - Agent components should implement virtualization for large lists
  - Image loading is optimized with Next.js Image component with proper sizing
  - Heavy animations should be disabled on mobile devices

### Authentication & Authorization

- Supabase handles authentication
- Role-based access control for premium features
- Agent access is controlled by user role/plan
- Testing accounts are available for each user role

### Critical Dependencies

- Framer Motion: Used extensively for animations
- Tailwind CSS: All styling is built on Tailwind
- Supabase: Backend database and authentication
- OpenAI API: Powers the AI agent functionality

This guide should help engineers working across different IDEs maintain consistency and avoid common pitfalls while developing for SKRBL AI.

## 🚀 SKRBL AI Platform

Your AI Superhero League of Business Automation Agents

### 🎯 Recent Updates - DOUBLE UP 105 COMPLETE ✅

**All 5 Tasks Successfully Implemented:**

1. **✅ N8N Real Workflow Connection** - Live integration with API key support, execution tracking, and Supabase logging
2. **✅ Percy SMS/Email/Voice Live Integration** - Real Twilio and Resend services with cosmic branding
3. **✅ Agent Analytics + Audit System** - Comprehensive usage tracking, CSV/JSON export, and cleanup automation
4. **✅ VIP Portal API** - Advanced recognition algorithm with personalized pricing (Standard $29 → Enterprise $2999)
5. **✅ Image Optimization Prework** - 14.5MB savings (39.8% reduction), 72s faster mobile loading

### 📊 Image Optimization Results
- **Critical Issue Resolved**: 10.8MB → 0.7MB (93.2% smaller) for `agents-adcreative-nobg-skrblai.png`
- **Mobile Performance**: 72.3s faster loading on 3G networks
- **Storage Savings**: 14.5MB per page load reduction
- **Ready for CDN**: WebP files generated, optimization utilities in place

### 🔧 New Scripts Available
```bash
npm run optimize-images     # Convert PNG to WebP (90%+ compression)
npm run image-audit        # Check file sizes
npm run image-performance  # Detailed optimization analysis
```

### 🌟 API Endpoints Added
- `/api/n8n/trigger` - Enhanced workflow triggering with real-time status
- `/api/percy/contact` - Live SMS/Email/Voice with Percy personality  
- `/api/analytics/agent-usage` - Usage tracking and analytics
- `/api/vip/recognition` - VIP scoring and personalized plans

### 🎨 Enhanced Features
- **WebP Support**: Browser detection and automatic format switching
- **CDN Ready**: Query parameters for quality, size, and format optimization
- **Mobile Optimized**: Context-aware image sizing (constellation, carousel, card, hero)
- **Performance Monitoring**: Real-time optimization impact tracking

---

## Core Features 