# 🔐 Complete Google OAuth + Analytics Setup Guide

**Date**: 2025-01-12  
**Purpose**: Set up Google Sign-In and Google Analytics for SKRBL AI

---

## 📋 Overview

You'll set up:
1. **Google OAuth** - Allow users to sign in with Google
2. **Google Analytics** - Track user behavior and conversions

---

## 🔧 Part 1: Google OAuth Setup

### Step 1: Create OAuth Credentials in Google Cloud

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select project: **SKRBLAI Auth** (or create new project)

2. **Enable Required APIs**:
   - Go to: https://console.cloud.google.com/apis/library
   - Search and enable: **Google+ API** (for user info)

3. **Configure OAuth Consent Screen**:
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - User Type: **External**
   - Click **Create**
   
   **Fill in:**
   - App name: `SKRBL AI`
   - User support email: `contact@skrblai.io`
   - App logo: (optional, upload your logo)
   - Application home page: `https://skrblai.io`
   - Application privacy policy: `https://skrblai.io/privacy-policy`
   - Application terms of service: `https://skrblai.io/terms-of-service`
   - Authorized domains:
     ```
     skrblai.io
     supabase.co
     ```
   - Developer contact: `contact@skrblai.io`
   - Click **Save and Continue**

4. **Scopes** (Step 2 of consent screen):
   - Click **Add or Remove Scopes**
   - Select:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Click **Update** → **Save and Continue**

5. **Test Users** (Step 3):
   - Add your email: `actionsoverdreams@gmail.com`
   - Click **Save and Continue**

6. **Summary** (Step 4):
   - Review and click **Back to Dashboard**

---

### Step 2: Create OAuth Client ID

1. **Go to Credentials**:
   - Visit: https://console.cloud.google.com/apis/credentials
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**

2. **Production Client**:
   - Application type: **Web application**
   - Name: `SKRBL AI Production`
   
   **Authorized JavaScript origins**:
   ```
   https://skrblai.io
   https://auth.skrblai.io
   https://zpqavydsinrtaxhowmnb.supabase.co
   ```
   
   **Authorized redirect URIs**:
   ```
   https://zpqavydsinrtaxhowmnb.supabase.co/auth/v1/callback
   https://skrblai.io/auth/callback
   ```
   
   - Click **Create**
   - **SAVE THESE CREDENTIALS**:
     - Client ID: `123456789-abc123.apps.googleusercontent.com`
     - Client Secret: `GOCSPX-abc123xyz`

3. **Development Client** (Optional but recommended):
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `SKRBL AI Development`
   
   **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```
   
   **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://zpqavydsinrtaxhowmnb.supabase.co/auth/v1/callback
   ```
   
   - Click **Create**
   - Save these credentials separately

---

### Step 3: Configure Supabase

1. **Go to Supabase Dashboard**:
   - Visit: https://zpqavydsinrtaxhowmnb.supabase.co
   - Go to **Authentication** → **Providers**

2. **Enable Google Provider**:
   - Find **Google** in the list
   - Toggle **Enable Sign in with Google** to ON

3. **Enter Credentials** (from Step 2):
   - **Client ID (for OAuth)**: Paste your production Client ID
   - **Client Secret (for OAuth)**: Paste your production Client Secret

4. **Optional Settings**:
   - ✅ **Skip nonce checks**: Keep enabled (simpler, less secure)
   - ✅ **Allow users without an email**: Keep enabled

5. **Callback URL** (auto-filled):
   - Should show: `https://zpqavydsinrtaxhowmnb.supabase.co/auth/v1/callback`

6. **Click Save**

---

### Step 4: Update Your Supabase Redirect URLs

1. **In Supabase Dashboard**:
   - Go to **Authentication** → **URL Configuration**

2. **Site URL**:
   ```
   https://skrblai.io
   ```

3. **Redirect URLs** (should already have these):
   ```
   https://skrblai.io
   http://localhost:3000
   https://skrblai.io/auth/callback
   http://localhost:3000/auth/callback
   https://auth.skrblai.io
   http://127.0.0.1:3000
   https://auth.skrblai.io/auth/v1/callback
   ```

4. **Click Save**

---

### Step 5: Test Google Sign-In Locally

1. **No code changes needed!** Supabase handles everything.

2. **Test it**:
   ```bash
   npm run dev
   ```

3. **Visit**: `http://localhost:3000/sign-in`

4. **You should see**:
   - "Sign in with Google" button
   - Click it → redirects to Google
   - Select your Google account
   - Redirects back to your app

5. **Check Supabase**:
   - Go to **Authentication** → **Users**
   - You should see your Google account listed

---

## 📊 Part 2: Google Analytics Setup

### Step 1: Create GA4 Property

1. **Go to Google Analytics**:
   - Visit: https://analytics.google.com/
   - Sign in with your Google account

2. **Create Account** (if you don't have one):
   - Click **Start measuring**
   - Account name: `SKRBL AI`
   - Click **Next**

3. **Create Property**:
   - Property name: `SKRBL AI Production`
   - Reporting time zone: `United States - Pacific Time`
   - Currency: `United States Dollar`
   - Click **Next**

4. **Business Details**:
   - Industry: `Technology` or `Software`
   - Business size: Select your size
   - Click **Next**

5. **Business Objectives**:
   - Select: `Generate leads`, `Examine user behavior`
   - Click **Create**

6. **Accept Terms of Service**

---

### Step 2: Set Up Data Stream

1. **Choose Platform**: **Web**

2. **Set up web stream**:
   - Website URL: `https://skrblai.io`
   - Stream name: `SKRBL AI Website`
   - Click **Create stream**

3. **Copy Measurement ID**:
   - You'll see: `G-XXXXXXXXXX`
   - **SAVE THIS!**

---

### Step 3: Add to Your .env.local

1. **Open**: `.env.local.clean`

2. **Uncomment and update**:
   ```env
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```
   (Replace with your actual Measurement ID)

---

### Step 4: Verify Analytics Code Exists

Check if you have Google Analytics integration in your codebase:

<function_calls>
<invoke name="grep_search">
<parameter name="SearchPath">c:\Users\baked\Documents\SKRBL_AI_DEPLOY_2025
