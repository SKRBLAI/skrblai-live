# 🔗 N8N PLATFORM SETUP GUIDE
## Step-by-Step Instructions for SKRBL AI Agent Integration

> **What you'll do**: Create 14 workflows in N8N that your SKRBL agents will trigger
> **Time needed**: 2-3 hours total (10-15 minutes per agent)
> **Difficulty**: Beginner-friendly with copy/paste templates

---

## 🎯 **EXACTLY WHAT TO DO IN N8N**

### **Step 1: Access Your N8N Instance**
1. Go to your N8N dashboard (e.g., `https://your-n8n-instance.com`)
2. Log in to your N8N account
3. Click **"New Workflow"** button

### **Step 2: Create Your First Agent Workflow**
Let's start with **BrandAlexander** (your branding agent):

#### **A. Set Up the Webhook Trigger**
1. **Add Webhook Node**:
   - Click the **"+"** button to add a node
   - Search for **"Webhook"** 
   - Select **"Webhook"** node
   - Drag it to the canvas

2. **Configure the Webhook**:
   - Click on the Webhook node
   - Set **HTTP Method**: `POST`
   - Set **Path**: `branding-identity-master`
   - Set **Authentication**: `None` (for now)
   - Click **"Save"**

3. **Copy the Webhook URL** (you'll need this later):
   - It will look like: `https://your-n8n-instance.com/webhook/branding-identity-master`

#### **B. Add OpenAI Processing Node**
1. **Add OpenAI Node**:
   - Click **"+"** after the Webhook
   - Search for **"OpenAI"**
   - Select **"OpenAI"** node

2. **Configure OpenAI Node**:
   - **Credentials**: Add your OpenAI API key
   - **Resource**: `Chat`
   - **Model**: `gpt-4` or `gpt-3.5-turbo`
   - **Messages**: Click **"Add Message"**
     - **Role**: `system`
     - **Content**: Copy this prompt:

```
You are BrandAlexander the Identity Architect, a superhero branding agent. 
You have the power to create compelling brand identities that resonate with target audiences.
Your mission: Create comprehensive branding solutions including logos, color schemes, and brand guidelines.

Based on the user's request, provide:
1. Brand concept and positioning
2. Logo description and design brief
3. Color palette (hex codes)
4. Typography recommendations
5. Brand voice and personality
6. Next steps for implementation

Be creative, professional, and superhero-confident in your response!
```

   - Add another message:
     - **Role**: `user`  
     - **Content**: `{{ $json.userPrompt }}` (this pulls from the webhook)

#### **C. Add Response Formatting Node**
1. **Add Function Node**:
   - Click **"+"** after OpenAI
   - Search for **"Code"**
   - Select **"Code"** node

2. **Add This JavaScript Code**:
```javascript
// Format the response for SKRBL AI
const openaiResponse = $input.first().json.message.content;

return [{
  json: {
    success: true,
    executionId: $json.executionId || `workflow_${Date.now()}_branding-agent`,
    agentId: "branding-agent",
    superheroName: "BrandAlexander the Identity Architect",
    result: {
      type: "brand_identity",
      output: openaiResponse,
      metadata: {
        processingTime: Date.now() - new Date($json.timestamp).getTime(),
        confidence: 95,
        model: "gpt-4"
      }
    },
    handoffSuggestions: [
      {
        agentId: "content-creator-agent",
        reason: "Create marketing copy for your new brand",
        confidence: 85
      },
      {
        agentId: "social-bot-agent", 
        reason: "Design social media strategy for your brand",
        confidence: 80
      }
    ],
    timestamp: new Date().toISOString(),
    status: "completed"
  }
}];
```

#### **D. Add Response Node**
1. **Add Respond to Webhook Node**:
   - Click **"+"** after the Code node
   - Search for **"Respond to Webhook"**
   - Select it
   - **Response Body**: `{{ $json }}`
   - **Response Code**: `200`

#### **E. Save Your Workflow**
1. Click **"Save"** button (top right)
2. **Workflow Name**: `BrandAlexander - Identity Master`
3. **Workflow ID**: Make sure it shows `branding-identity-master`
4. Click **"Activate"** toggle to make it live! ✅

---

## 🔥 **QUICK COPY-PASTE TEMPLATES FOR ALL 14 AGENTS**

Now that you understand the pattern, here are the exact configurations for each agent:

### **2. Percy Orchestration Master**
- **Webhook Path**: `percy-orchestration-master`
- **System Prompt**:
```
You are Percy the Cosmic Concierge, the ultimate AI orchestrator. 
Your superpower is coordinating multiple agents and determining the perfect workflow for any request.
Analyze the user's needs and either handle the request directly or recommend the best agent combination.
Always be helpful, confident, and strategic in your recommendations.
```

### **3. ContentCarltig Creation Master** 
- **Webhook Path**: `content-creation-master`
- **System Prompt**:
```
You are ContentCarltig the Content Virtuoso, master of written communication.
Your superpower is creating engaging, SEO-optimized content that converts.
Create blog posts, articles, website copy, or any written content that drives results.
Always include SEO keywords and engagement hooks.
```

### **4. SocialNino Media Master**
- **Webhook Path**: `social-media-master` 
- **System Prompt**:
```
You are SocialNino the Viral Virtuoso, master of social media engagement.
Your superpower is creating content that goes viral and builds communities.
Create social media strategies, posts, captions, and hashtag recommendations.
Always focus on engagement, trending topics, and audience building.
```

### **5. Analytics Don Insights Master**
- **Webhook Path**: `analytics-insights-master`
- **System Prompt**:
```
You are Analytics Don the Data Detective, master of insights and predictions.
Your superpower is analyzing data and predicting trends with 95% accuracy.
Provide actionable insights, performance recommendations, and strategic data analysis.
Always include specific metrics and next steps.
```

### **6. AdmEthen Creative Master**
- **Webhook Path**: `ad-creative-master`
- **System Prompt**:
```
You are AdmEthen the Conversion Commander, master of high-converting advertising.
Your superpower is creating ads that stop the scroll and drive conversions.
Create ad copy, creative concepts, and campaign strategies that maximize ROI.
Always focus on psychology, urgency, and clear calls-to-action.
```

---

## 🚀 **RAPID WORKFLOW CREATION PROCESS**

For the remaining 9 agents, follow this **5-minute pattern**:

1. **Click "New Workflow"**
2. **Add Webhook node** → Set path from table below
3. **Add OpenAI node** → Use system prompt from table below  
4. **Add Code node** → Copy the same JavaScript (change agentId and superheroName)
5. **Add Respond to Webhook node**
6. **Save & Activate**

### **Remaining Agents Quick Reference**:

| Agent | Webhook Path | Superhero Name | Key Focus |
|-------|-------------|---------------|-----------|
| **VideoVirtuoso** | `video-creation-master` | VideoVirtuoso the Visual Storyteller | Video content & storytelling |
| **PublishingPro** | `publishing-master` | PublishingPro the Literary Legend | Book publishing & editing |
| **SiteGenGuru** | `sitegen-web-master` | SiteGenGuru the Web Architect | Website creation & optimization |
| **SyncMaster** | `sync-master` | SyncMaster the Data Harmonizer | Data sync & integration |
| **ClientSuccess** | `client-success-master` | ClientSuccess the Relationship Guardian | Client management & success |
| **PaymentsPro** | `payments-master` | PaymentsPro the Revenue Optimizer | Payment processing & revenue |
| **BizBrain** | `biz-strategy-master` | BizBrain the Strategic Sage | Business strategy & planning |
| **ProposalPro** | `proposal-master` | ProposalPro the Deal Closer | Business proposals & contracts |

---

## ✅ **TESTING YOUR WORKFLOWS**

### **Test Individual Workflow**:
1. In N8N, click on your workflow
2. Click the **"Test Workflow"** button  
3. Click on the Webhook node
4. Click **"Listen for calls"**
5. Open a new tab and run this curl command:

```bash
curl -X POST https://your-n8n-instance.com/webhook/branding-identity-master \
  -H "Content-Type: application/json" \
  -d '{
    "executionId": "test_123",
    "userPrompt": "Create a logo for my coffee shop called Brew Masters",
    "timestamp": "'$(date -Iseconds)'"
  }'
```

### **Expected Response**:
You should see a JSON response with the brand recommendations! 🎉

---

## 🔧 **ENVIRONMENT VARIABLES TO ADD**

Once your workflows are created, add these to your SKRBL AI `.env` file:

```bash
# N8N Configuration  
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com

# Optional: Usage limits
N8N_DAILY_LIMIT=1000
N8N_MONTHLY_LIMIT=10000
N8N_CONCURRENT_LIMIT=5
```

---

## 🎊 **YOU'RE DONE! WHAT HAPPENS NEXT?**

Once you complete this setup:

1. **Your SKRBL agents will automatically trigger N8N workflows**
2. **Users can click LAUNCH buttons and get real AI-powered results**
3. **Agents will suggest handoffs to other agents** 
4. **You'll have a fully automated superhero agent army! 🦸‍♂️⚡**

### **Test Your Integration**:
Go to your SKRBL AI app → Agent League → Click any agent's **"LAUNCH"** button → Watch the magic happen!

---

## 🆘 **NEED HELP?**

**Common Issues**:
- **Webhook not responding**: Check the path matches exactly
- **OpenAI errors**: Verify your API key is added to N8N credentials
- **Timeout errors**: Increase timeout in N8N settings

**Questions?** Drop me a message and I'll help you debug any specific workflow! 

**Your superhero automation army awaits! 🚀**
