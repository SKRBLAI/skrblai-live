# Founder Codes Data Directory

This directory contains founder code configuration files for the SKRBL AI founder system.

## Files

- `founders.local.json.example` - Example structure for founder codes
- `founders.local.json` - **Local file (not committed)** - Contains actual founder codes

## Security Notes

⚠️ **IMPORTANT**: Never commit actual founder codes to version control!

- The `founders.local.json` file should be added to `.gitignore`
- Founder codes are hashed with bcrypt before storage
- Only labels and metadata are logged, never plaintext codes

## Usage

1. Copy `founders.local.json.example` to `founders.local.json`
2. Replace example codes with actual founder codes
3. Run `npm run seed:founders` to seed the database

## Code Structure

```json
[
  {
    "label": "BrandAlexander",
    "role": "founder",
    "agent_likeness": "BrandAlexander", 
    "code": "your_secure_code_here",
    "max_redemptions": 1,
    "expires_at": "2025-12-31T23:59:59Z"
  }
]
```

## Roles

- `creator` - Full system access + admin oversight
- `founder` - Premium access to all features
- `heir` - Legacy access with premium features

## Environment Alternative

Instead of local files, you can set the `FOUNDER_CODES` environment variable:

```bash
export FOUNDER_CODES='[{"label":"Test","role":"founder","agent_likeness":"Percy","code":"test123"}]'
```