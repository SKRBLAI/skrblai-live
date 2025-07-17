# SKRBL AI – Engineering & UI/UX Change Log
**Date:** June 13, 2025

---

## Summary
This README documents all major fixes, UI/UX changes, refactors, and outstanding issues as of June 13, 2025. It is designed for seamless handoff between Cursor (logic/backend) and Windsurf (UI/UX), and should be updated as further changes are made.

---

## Recent Fixes & Improvements

### 1. Authentication (Sign Up/Sign In)
- **n8n Webhook Integration:**
  - Webhook calls for `signup` and `signin` events are implemented with retry logic and error logging.
  - Webhook logic moved out of UI for separation of concerns.
- **Global Confirmation Banner:**
  - `ActionBanner` and `BannerContext` provide global, animated feedback for user actions.
  - Banners auto-dismiss and support variants (success, error, info).
- **UI Polish:**
  - Created reusable `AuthProviderButton` for Google, Magic Link, and LinkedIn (if enabled).
  - Added loading spinners and provider-specific styling to auth buttons.
  - Refactored sign-in and sign-up pages for consistent, accessible UI.
  - Added divider with "Or continue with" between OAuth and form.
  - Improved error handling and feedback for all flows.
- **Supabase Auth Refactor:**
  - Switched to `@supabase/auth-helpers-nextjs` for client instantiation.
  - Cleaned up legacy imports and logic.
  - Updated session subscription cleanup for memory safety.
- **Promo/VIP Code and Marketing Consent:**
  - Promo/VIP codes now stored in `user_codes` table (logic, not UI).
  - Marketing consent stored in `user_preferences` table.
- **Outstanding:**
  - Some webhook logic and error handling is now delegated to Cursor for further backend improvements.

### 2. Homepage & Hero Section
- **Percy Hero Redesign:**
  - Percy is centered with glowing/cosmic animation.
  - Headline uses gradient text.
  - Glassmorphism onboarding card with prompt input and file upload.
  - More particles, radial gradients, and cosmic effects.
  - Responsive and mobile-friendly.
- **Agent Carousel:**
  - Replaced AgentConstellation with a more mobile-friendly carousel.
- **Accessibility:**
  - Added aria-labels, improved contrast, and larger touch targets.

### 3. Component & CSS Refactors
- **Removed Inline Styles:**
  - All inline `boxShadow`, `filter`, and gradient backgrounds replaced with Tailwind or custom classes.
  - Examples: PercyHero agent glow (`agent-card-glow-blue`), max-width (`max-w-screen`), gradient backgrounds (`agent-card-image-bg`).
- **AgentConstellation:**
  - Tailwind JIT used for drop-shadow, grayscale, and border effects.
  - Centering now uses `left-1/2 top-1/2` and `transform` utilities.

### 4. Design System
- **Color, Typography, and Animation:**
  - Electric Blue as primary (#0066FF), dark gradients for backgrounds.
  - Bold, gradient headings; gray-300 for secondary text.
  - Framer Motion for all major animations.
  - Rounded corners, shadow-glow, and interactive hover states standardized.

### 5. TypeScript & Build Fixes
- **Type/interface cleanup:**
  - Added missing fields, improved type safety in auth and integration modules.
  - Subscription cleanup standardized across hooks and pages.
  - Build is stable as of this date.

---

## Outstanding Issues & Next Steps
- **Sign In/Sign Up:**
  - Remaining backend logic, webhook, and error handling improvements are assigned to Cursor.
  - Further polish for edge cases and accessibility (Cursor + Windsurf).
- **Modals & Overlays:**
  - Consistent animation, focus management, and accessibility audit needed.
  - Overlay polish and dialog accessibility are next UI priorities.
- **Agent League Grid & Percy Placement:**
  - Further polish and responsive tweaks planned.
- **Accessibility:**
  - Full audit and fixes for dialogs, overlays, and keyboard navigation.
- **README Maintenance:**
  - Cursor and Windsurf should append all major changes, fixes, and outstanding tasks here for future handoff.

---

## How to Use This Doc
- **For Cursor:**
  - Review all outstanding logic/backend items and update this doc as you resolve them.
- **For Windsurf:**
  - Continue UI/UX polish, accessibility, and design system improvements. Document changes here.
- **For All Contributors:**
  - Keep this README as the single source of truth for project state and handoff.

---

*Last updated: June 13, 2025 by Windsurf UI/UX Agent*
