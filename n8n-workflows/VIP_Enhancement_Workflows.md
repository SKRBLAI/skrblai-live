# SKRBL AI VIP Enhancement n8n Workflows

## 🚀 Required n8n Workflows for VIP System

### 1. Percy Global Orchestrator
**Workflow Name**: `Percy-Global-Orchestrator`
**Trigger**: HTTP Webhook
**Purpose**: Central coordination for all Percy interactions

#### Nodes:
1. **Webhook Trigger** (`webhook-percy-global`)
   - URL: `/webhook/percy-global`
   - Method: POST
   - Response: Immediate

2. **Function Node** (`classify-request`)
   ```javascript
   const requestType = $json.type;
   const userData = $json.user;
   const vipTier = userData?.vipTier;
   
   return {
     requestType,
     vipTier,
     userData,
     priority: vipTier ? 'high' : 'normal',
     routing: vipTier ? 'vip-flow' : 'standard-flow'
   };
   ```

3. **Switch Node** (`route-by-tier`)
   - Route 1: VIP Users (Gold/Platinum/Diamond)
   - Route 2: Standard Users

4. **Supabase Node** (`log-interaction`)
   - Table: `percy_interactions`
   - Operation: Insert
   - Fields: user_id, request_type, vip_tier, timestamp

---

### 2. VIP Code Validation Workflow
**Workflow Name**: `VIP-Code-Validator`
**Trigger**: HTTP Webhook
**Purpose**: Validate and process VIP code entries

#### Nodes:
1. **Webhook Trigger** (`webhook-vip-code`)
   - URL: `/webhook/vip-code-validation`
   - Method: POST

2. **Function Node** (`validate-vip-code`)
   ```javascript
   const code = $json.code.toUpperCase();
   const validCodes = {
     'SKRBL-VIP-GOLD-2024': 'gold',
     'PERCY-GOLDEN-KEY': 'gold',
     'ELITE-ACCESS-2024': 'gold',
     'PERCY-EXCLUSIVE-PLATINUM': 'platinum',
     'SKRBL-PREMIUM-2024': 'platinum',
     'VIP-PLATINUM-PERCY': 'platinum',
     'SKRBL-DIAMOND-ELITE': 'diamond',
     'PERCY-DIAMOND-2024': 'diamond',
     'ULTIMATE-VIP-ACCESS': 'diamond'
   };
   
   const tier = validCodes[code];
   return {
     isValid: !!tier,
     tier: tier || null,
     code,
     timestamp: new Date().toISOString()
   };
   ```

3. **If Node** (`check-validity`)
   - Condition: `{{ $json.isValid === true }}`

4. **Supabase Node** (`update-user-vip-status`)
   - Table: `users`
   - Operation: Update
   - Filter: user_id
   - Fields: vip_tier, vip_activated_at

5. **HTTP Request Node** (`trigger-vip-welcome`)
   - URL: Internal webhook for VIP welcome sequence
   - Method: POST

---

### 3. VIP SMS Onboarding Workflow
**Workflow Name**: `VIP-SMS-Onboarding`
**Trigger**: HTTP Webhook
**Purpose**: Handle VIP SMS verification and welcome messages

#### Nodes:
1. **Webhook Trigger** (`webhook-sms-vip`)
   - URL: `/webhook/vip-sms-onboarding`
   - Method: POST

2. **Function Node** (`format-vip-message`)
   ```javascript
   const { phoneNumber, vipTier, step } = $json;
   
   const messages = {
     verification: {
       gold: `🥇 SKRBL AI VIP GOLD: Your verification code is {code}. Priority AI access awaits!`,
       platinum: `🔥 SKRBL AI VIP PLATINUM: Your verification code is {code}. White-glove AI experience starts now!`,
       diamond: `💎 SKRBL AI VIP DIAMOND: Your verification code is {code}. Unlimited AI empire access activated!`
     },
     welcome: {
       gold: `🎉 VIP Gold Activated! You now have priority support, enhanced analytics, and exclusive templates. Text HELP for instant assistance. Your AI empire starts now!`,
       platinum: `👑 VIP Platinum Activated! White glove support, advanced AI models, and custom integrations ready. Text CONCIERGE for immediate help!`,
       diamond: `💎 VIP Diamond Activated! Unlimited access, dedicated account manager, and direct CEO line ready. Text LUXURY for VIP services!`
     }
   };
   
   return {
     message: messages[step][vipTier],
     phoneNumber,
     vipTier
   };
   ```

3. **HTTP Request Node** (`send-twilio-sms`)
   - URL: Twilio API endpoint
   - Authentication: API Key
   - Method: POST

---

### 4. VIP Dashboard Experience Workflow
**Workflow Name**: `VIP-Dashboard-Experience`
**Trigger**: HTTP Webhook
**Purpose**: Customize dashboard content based on VIP tier

#### Nodes:
1. **Webhook Trigger** (`webhook-vip-dashboard`)
   - URL: `/webhook/vip-dashboard-load`
   - Method: POST

2. **Function Node** (`generate-vip-content`)
   ```javascript
   const { userId, vipTier } = $json;
   
   const contentConfig = {
     gold: {
       features: ['Priority Support', 'Enhanced Analytics', 'Exclusive Templates', 'Early Access'],
       colorScheme: 'from-yellow-400 to-orange-500',
       exclusiveTools: ['Advanced Reporting', 'Template Library', 'Priority Queue']
     },
     platinum: {
       features: ['White Glove Support', 'Advanced AI Models', 'Custom Integrations', 'Beta Access'],
       colorScheme: 'from-gray-300 to-gray-500',
       exclusiveTools: ['Custom AI Training', 'API Access', 'Dedicated Support']
     },
     diamond: {
       features: ['Dedicated Account Manager', 'Unlimited Everything', 'Personal AI Consultant', 'Direct CEO Access'],
       colorScheme: 'from-cyan-400 to-purple-600',
       exclusiveTools: ['Unlimited Access', 'Personal Consultant', 'Enterprise Features']
     }
   };
   
   return contentConfig[vipTier] || {};
   ```

3. **Supabase Node** (`fetch-vip-analytics`)
   - Table: `user_analytics`
   - Operation: Select
   - Filter: user_id AND vip_tier

---

### 5. AI Empowerment Coach Workflow
**Workflow Name**: `AI-Empowerment-Coach`
**Trigger**: HTTP Webhook
**Purpose**: Deliver contextual empowerment messages

#### Nodes:
1. **Webhook Trigger** (`webhook-empowerment`)
   - URL: `/webhook/empowerment-coach`
   - Method: POST

2. **Function Node** (`generate-empowerment-message`)
   ```javascript
   const { userId, vipTier, interactionCount, action } = $json;
   
   const vipMessages = {
     welcome: {
       gold: "🥇 Welcome back, VIP Gold! Your priority AI access puts you ahead of 99% of users!",
       platinum: "🔥 Welcome back, VIP Platinum! Your white-glove experience is reshaping industries!",
       diamond: "💎 Welcome back, VIP Diamond! Your unlimited access knows no bounds!"
     },
     achievement: {
       gold: "🎯 VIP Gold Achievement: You're mastering AI at an elite level!",
       platinum: "⚡ VIP Platinum Power: Your advanced tools are creating market dominance!",
       diamond: "👑 VIP Diamond Excellence: You're operating at the highest level of AI mastery!"
     }
   };
   
   const message = vipTier ? vipMessages[action][vipTier] : getStandardMessage(action);
   
   return { message, vipTier, userId };
   ```

3. **HTTP Request Node** (`deliver-message`)
   - URL: Frontend message endpoint
   - Method: POST

---

### 6. VIP Concierge Support Workflow
**Workflow Name**: `VIP-Concierge-Support`
**Trigger**: HTTP Webhook
**Purpose**: Handle VIP support requests with priority routing

#### Nodes:
1. **Webhook Trigger** (`webhook-vip-support`)
   - URL: `/webhook/vip-concierge`
   - Method: POST

2. **Function Node** (`prioritize-request`)
   ```javascript
   const { vipTier, requestType, urgency } = $json;
   
   const priority = {
     diamond: 1,    // Immediate response
     platinum: 2,   // <5 minutes
     gold: 3        // <15 minutes
   };
   
   return {
     priority: priority[vipTier],
     escalation: vipTier === 'diamond' ? 'direct-to-ceo' : 'standard',
     responseTime: priority[vipTier] === 1 ? 'immediate' : 'fast'
   };
   ```

3. **Slack Node** (`notify-vip-team`)
   - Channel: #vip-support
   - Message: Priority alert with tier and request details

---

## 🔧 Configuration Requirements

### Environment Variables Needed:
```env
# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# n8n Webhooks
N8N_WEBHOOK_URL=your_n8n_instance_url
```

### Database Tables Required:
1. `users` - user_id, vip_tier, vip_activated_at
2. `percy_interactions` - user_id, request_type, vip_tier, timestamp
3. `vip_support_requests` - user_id, vip_tier, priority, status
4. `user_analytics` - user_id, metric_name, value, timestamp

---

## 🚀 Deployment Checklist

- [ ] Import all 6 workflows into n8n
- [ ] Configure webhook URLs in application
- [ ] Set up environment variables
- [ ] Test VIP code validation
- [ ] Test SMS onboarding flow
- [ ] Verify dashboard customization
- [ ] Test empowerment coach messaging
- [ ] Configure support escalation
- [ ] Monitor workflow execution logs

---

## 📊 Success Metrics

- VIP onboarding completion rate
- SMS engagement rates by tier
- Support response times by tier
- Dashboard engagement metrics
- Empowerment message effectiveness
- User retention by VIP tier

This comprehensive workflow system creates a truly premium VIP experience that makes users feel valued and empowered while providing measurable business benefits.