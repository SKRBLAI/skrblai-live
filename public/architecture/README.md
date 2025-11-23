# SKRBL AI Architecture Diagrams

This directory contains visual architecture diagrams for the SKRBL AI platform.

## Files

### `current-map.mmd`
Mermaid diagram source showing the complete system architecture including:
- Entry & Auth Layer
- Feature Flags Control
- Database Layer
- Routing Layer
- Percy AI System
- Agent System
- n8n Automation
- Payment System
- External Services
- Monitoring

## How to Render Diagrams

### Option 1: Mermaid Live Editor
1. Go to [mermaid.live](https://mermaid.live)
2. Copy the contents of `current-map.mmd`
3. Paste into the editor
4. Click "Export" → PNG or SVG
5. Save as `current-map.png` in this directory

### Option 2: GitHub (Automatic)
GitHub automatically renders `.mmd` files in markdown. View the file on GitHub to see the rendered diagram.

### Option 3: VS Code Extension
1. Install "Markdown Preview Mermaid Support" extension
2. Open `current-map.mmd`
3. Use Command Palette: "Markdown: Open Preview to the Side"
4. Right-click on diagram → Export

### Option 4: Command Line (mermaid-cli)
```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Generate PNG
mmdc -i current-map.mmd -o current-map.png -w 4000 -H 3000

# Generate SVG
mmdc -i current-map.mmd -o current-map.svg
```

## Diagram Color Legend

- 🔴 **Red** - Critical components requiring attention (e.g., Legacy Percy)
- 🟡 **Yellow** - Warning states (e.g., NOOP mode, disabled features)
- 🟢 **Green** - Optimized/recommended components
- 🔵 **Blue/Teal** - Active auth systems
- ⚪ **Gray** - Prepared but inactive features

## Related Documentation

- **Full Audit Report:** `/CODEBASE_AUDIT_REPORT.md`
- **System Audit with Visuals:** `/docs/SKRBL_SYSTEM_AUDIT.md`
- **Feature Flag Configuration:** `/lib/config/featureFlags.ts`

## Maintenance

Update these diagrams when:
- New major features are added
- Auth systems change (migration to Boost/Clerk)
- Feature flags are added/removed
- External integrations change
- Architecture patterns evolve

Last Updated: 2025-10-31
