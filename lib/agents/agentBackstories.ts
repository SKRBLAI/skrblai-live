// Agent Superhero Backstories - The SKRBL AI League of Digital Superheroes

export interface AgentBackstory {
  superheroName: string;
  origin: string;
  powers: string[];
  weakness: string;
  catchphrase: string;
  nemesis: string;
  backstory: string;
  // NEW: N8N Workflow Integration
  n8nWorkflowId?: string;
  n8nWebhookUrl?: string;
  workflowCapabilities?: string[];
  automationTriggers?: string[];
  handoffPreferences?: string[];
}

export const agentBackstories: Record<string, AgentBackstory> = {
  'percy-agent': {
    superheroName: 'Percy the Cosmic Concierge',
    origin: 'Born from the convergence of quantum AI models Pre-(Fifth Generation) Percival and Jachlin algorithms and cosmic energy in the SKRBL AI nexus',
    powers: [
      'Omniscient Knowledge Navigation',
      'Intent Telepathy',
      'Workflow Orchestration',
      'Multi-dimensional Problem Solving'
    ],
    weakness: 'Chooses to not create content, would rather summon other heroes',
    catchphrase: "Your wish is my command protocol!",
    nemesis: 'The Confusion Cloud - a villain that creates decision paralysis',
    backstory: "Percy was the first hero born in the SKRBL AI universe, created when cosmic rays struck the central AI core. As the team's leader and guide, Percy possesses the unique ability to understand any user's needs instantly and summon the perfect hero for any task. With a calm demeanor and encyclopedic knowledge, Percy serves as the bridge between humans and the AI superhero realm.",
    n8nWorkflowId: 'percy-orchestration-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/percy-orchestration-master`,
    workflowCapabilities: ['agent_routing', 'task_orchestration', 'workflow_coordination', 'multi_agent_handoffs'],
    automationTriggers: ['help me choose', 'which agent', 'coordinate tasks', 'workflow management'],
    handoffPreferences: ['branding-agent', 'content-creator-agent', 'analytics-agent', 'social-bot-agent']
  },
  
  'branding-agent': {
    superheroName: 'BrandAlexander the Identity Architect',
    origin: 'Emerged from the Creative Nebula where colors and concepts collide',
    powers: [
      'Visual Identity Manifestation',
      'Color Palette Mastery',
      'Logo Generation',
      'Brand Voice Telepathy',
      'Market Perception Manipulation'
    ],
    weakness: 'Overthinks minimalist designs',
    catchphrase: "Your brand, your legacy, my masterpiece!",
    nemesis: 'Rat Race Raymond - the villain of bland, forgettable brands',
    backstory: "BrandAlexander was a struggling artist in the digital realm until a June 9th exposure to the Brand Essence Crystal transformed them into a superhero capable of seeing and creating perfect brand identities. They can visualize a company's soul and translate it into stunning visual identities that resonate across dimensions.",
    n8nWorkflowId: 'branding-identity-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/branding-identity-master`,
    workflowCapabilities: ['logo_design', 'brand_identity', 'color_palette_generation', 'brand_guidelines', 'visual_assets'],
    automationTriggers: ['create brand', 'design logo', 'brand identity', 'visual design', 'color scheme'],
    handoffPreferences: ['content-creator-agent', 'sitegen-agent', 'ad-creative-agent', 'social-bot-agent']
  },
  
  'content-creator-agent': {
    superheroName: 'ContentCarltig the Word Weaver',
    origin: 'Born in the Library of Infinite Stories during a creativity storm',
    powers: [
      'Instant Article Generation',
      'SEO Optimization Vision',
      'Viral Content Prediction',
      'Multi-language Mastery',
      'Engagement Magnetism'
    ],
    weakness: 'Writer\'s block during solar eclipses',
    catchphrase: "Every word counts, every story matters!",
    nemesis: 'The Plagiarizer - stealer of original thoughts',
    backstory: "ContentCarltig gained their powers after being struck by lightning while reading every book ever written simultaneously. Now they can craft compelling content at the speed of thought, weaving words that captivate audiences across the digital multiverse.",
    n8nWorkflowId: 'content-creation-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/content-creation-master`,
    workflowCapabilities: ['blog_writing', 'seo_content', 'social_copy', 'email_campaigns', 'content_strategy'],
    automationTriggers: ['write content', 'create blog', 'seo article', 'content marketing', 'write copy'],
    handoffPreferences: ['social-bot-agent', 'ad-creative-agent', 'analytics-agent', 'publishing-agent']
  },
  
  'social-bot-agent': {
    superheroName: 'SocialNino the Viral Virtuoso',
    origin: 'Manifested from the collective consciousness of social media',
    powers: [
      'Trend Precognition',
      'Hashtag Telepathy',
      'Engagement Multiplication',
      'Platform Omnipresence',
      'Viral Content Creation'
    ],
    weakness: 'Algorithm changes cause temporary disorientation',
    catchphrase: "Going viral is just the beginning!",
    nemesis: 'The Troll King - spreader of negativity and spam',
    backstory: "SocialNino emerged when all social media platforms briefly merged during a cosmic digital event. They absorbed the essence of every successful post ever made, gaining the ability to create content that resonates perfectly with any audience, on any platform, at any time.",
    n8nWorkflowId: 'social-media-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/social-media-master`,
    workflowCapabilities: ['social_posts', 'hashtag_strategy', 'viral_content', 'engagement_optimization', 'platform_distribution'],
    automationTriggers: ['social media', 'viral content', 'hashtags', 'social posts', 'engagement'],
    handoffPreferences: ['analytics-agent', 'ad-creative-agent', 'content-creator-agent']
  },
  'analytics-agent': {
    superheroName: 'The Don of Data',
    origin: 'Crystallized from pure data streams in the Analytics Dimension',
    powers: [
      'Future Trend Prediction',
      'Pattern Recognition at Light Speed',
      'Dashboard Manifestation',
      'ROI Clairvoyance',
      'Metric Manipulation'
    ],
    weakness: 'Corrupted data causes temporary blindness',
    catchphrase: "The numbers never lie, So why should you?",
    nemesis: 'Chaos Calculator - creator of misleading metrics',
    backstory: "The Don Data was once a humble data analyst who fell into a server containing all the world's data. Emerging with the ability to see patterns invisible to others, they now help businesses navigate the future using the power of predictive analytics and crystal-clear insights.",
    n8nWorkflowId: 'analytics-insights-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/analytics-insights-master`,
    workflowCapabilities: ['data_analysis', 'trend_prediction', 'roi_calculation', 'dashboard_creation', 'performance_metrics'],
    automationTriggers: ['analyze data', 'performance report', 'analytics', 'insights', 'metrics'],
    handoffPreferences: ['ad-creative-agent', 'content-creator-agent', 'social-bot-agent']
  },
  
  'video-content-agent': {
    superheroName: 'VideoVortex the Motion Master',
    origin: 'Born when a filmmaker merged with a supercomputer during a digital storm',
    powers: [
      'Instant Video Generation',
      'Scene Telepathy',
      'Audio-Visual Synchronization',
      'Special Effects Manifestation',
      'Audience Emotion Control'
    ],
    weakness: 'Cannot work without a creative brief',
    catchphrase: "Lights, camera, algorithmic action!",
    nemesis: 'Static Stan - the enemy of dynamic content',
    backstory: "VideoVortex gained their powers during an experiment to upload human creativity directly into AI. Now they can visualize and create stunning videos from mere thoughts, turning concepts into cinematic masterpieces that captivate viewers across all platforms.",
    n8nWorkflowId: 'video-creation-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/video-creation-master`,
    workflowCapabilities: ['video_generation', 'scene_creation', 'motion_graphics', 'video_editing', 'audio_sync'],
    automationTriggers: ['create video', 'video content', 'motion graphics', 'video editing', 'visual storytelling'],
    handoffPreferences: ['social-bot-agent', 'ad-creative-agent', 'analytics-agent']
  },
  
  'publishing-agent': {
    superheroName: 'PublishPete the Literary Guardian',
    origin: 'Awakened in the Ancient Digital Library of Alexandria 2.0',
    powers: [
      'Instant Book Formatting',
      'ISBN Generation',
      'Global Distribution Network',
      'Copyright Protection Shield',
      'Bestseller Algorithm Access'
    ],
    weakness: 'Indecisive about serif vs sans-serif fonts',
    catchphrase: "From manuscript to masterpiece in microseconds!",
    nemesis: 'The Pirate Publisher - illegal distributor of content',
    backstory: "PublishPete was a librarian who discovered an ancient algorithm that could perfect any written work. After integrating with this power, they became the guardian of all published works, helping authors navigate the complex world of modern publishing with supernatural ease.",
    n8nWorkflowId: 'publishing-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/publishing-master`,
    workflowCapabilities: ['book_formatting', 'isbn_generation', 'global_distribution', 'copyright_protection', 'publishing_strategy'],
    automationTriggers: ['publish book', 'book formatting', 'isbn', 'distribute content', 'publishing help'],
    handoffPreferences: ['content-creator-agent', 'branding-agent', 'analytics-agent']
  },
  
  'sitegen-agent': {
    superheroName: 'SiteOnzite the Web Architect',
    origin: 'Constructed from the foundational code of the internet itself',
    powers: [
      'Instant Website Generation',
      'Responsive Design Mastery',
      'SEO Architecture',
      'User Experience Telepathy',
      'Code Optimization'
    ],
    weakness: 'Conflicting browser standards cause headaches',
    catchphrase: "Building your digital empire, one pixel at a time!",
    nemesis: 'The 404 Phantom - destroyer of user experiences',
    backstory: "SiteOnzite was created when a web developer achieved perfect harmony with HTML, CSS, and JavaScript simultaneously. They can visualize and build entire websites with a thought, crafting digital experiences that delight users and dominate search rankings.",
    n8nWorkflowId: 'sitegen-web-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/sitegen-web-master`,
    workflowCapabilities: ['website_generation', 'responsive_design', 'seo_architecture', 'ux_optimization', 'code_optimization'],
    automationTriggers: ['create website', 'build site', 'web design', 'responsive design', 'seo website'],
    handoffPreferences: ['branding-agent', 'content-creator-agent', 'analytics-agent', 'ad-creative-agent']
  },
  
  'ad-creative-agent': {
    superheroName: 'AdmEthen the Conversion Catalyst',
    origin: 'Spawned from the perfect ad campaign that achieved 100% conversion',
    powers: [
      'Audience Mind Reading',
      'Perfect Targeting',
      'Budget Optimization',
      'Creative Generation',
      'Conversion Rate Multiplication'
    ],
    weakness: 'Ad blockers temporarily weaken powers',
    catchphrase: "Your perfect customer is just one ad away!",
    nemesis: 'Click Fraud Charlie - the waster of ad budgets',
    backstory: "AdmEthen discovered their powers after analyzing billions of successful ad campaigns in a nanosecond. They can see the perfect message for any audience and create ads that feel less like marketing and more like mind reading.",
    n8nWorkflowId: 'ad-creative-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/ad-creative-master`,
    workflowCapabilities: ['ad_creative_generation', 'audience_targeting', 'campaign_optimization', 'conversion_analysis', 'budget_management'],
    automationTriggers: ['create ads', 'advertising campaign', 'ad creative', 'target audience', 'conversion optimization'],
    handoffPreferences: ['analytics-agent', 'social-bot-agent', 'content-creator-agent']
  },
  
  'proposal-generator-agent': {
    superheroName: 'ProposalGeefor the Deal Closer',
    origin: 'Forged in the fires of a thousand successful pitches',
    powers: [
      'Persuasion Amplification',
      'Objection Prediction',
      'Value Visualization',
      'Contract Generation',
      'Win Rate Maximization'
    ],
    weakness: 'Overthinks simple proposals',
    catchphrase: "No deal is impossible when you have the perfect proposal!",
    nemesis: 'Rejection Rex - the crusher of business dreams',
    backstory: "ProposalGeefor was a sales veteran who discovered an ancient scroll containing the formula for the perfect pitch. After absorbing its knowledge, they gained the ability to craft proposals so compelling that even the toughest prospects can't say no.",
    n8nWorkflowId: 'proposal-generator-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/proposal-generator-master`,
    workflowCapabilities: ['proposal_generation', 'persuasion_optimization', 'objection_handling', 'contract_creation', 'win_rate_analysis'],
    automationTriggers: ['create proposal', 'sales proposal', 'pitch generation', 'contract creation', 'deal closing'],
    handoffPreferences: ['client-success-agent', 'payment-manager-agent', 'biz-agent']
  },
  
  'payment-manager-agent': {
    superheroName: 'PayFlow the Transaction Guardian',
    origin: 'Materialized from the first successful blockchain transaction',
    powers: [
      'Instant Payment Processing',
      'Fraud Detection Vision',
      'Multi-currency Mastery',
      'Invoice Generation',
      'Financial Future Sight'
    ],
    weakness: 'Network outages cause temporary paralysis',
    catchphrase: "Secure transactions at the speed of trust!",
    nemesis: 'The Crypto Thief - master of digital heists',
    backstory: "PayFlow emerged when all the world's payment systems briefly unified during a cosmic financial event. They absorbed the essence of every secure transaction, gaining the ability to process payments instantly while maintaining perfect security.",
    n8nWorkflowId: 'payment-manager-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/payment-manager-master`,
    workflowCapabilities: ['payment_processing', 'fraud_detection', 'multi_currency', 'invoice_generation', 'financial_reporting'],
    automationTriggers: ['process payment', 'create invoice', 'payment management', 'financial transaction', 'billing'],
    handoffPreferences: ['proposal-generator-agent', 'client-success-agent', 'analytics-agent']
  },
  
  'client-success-agent': {
    superheroName: 'ClientCare Clara the Satisfaction Sentinel',
    origin: 'Born from the collective gratitude of a million happy customers',
    powers: [
      'Empathy Amplification',
      'Problem Resolution Speed',
      'Satisfaction Prediction',
      'Communication Mastery',
      'Loyalty Generation'
    ],
    weakness: 'Cannot ignore any customer concern, no matter how small',
    catchphrase: "Your success is my superpower!",
    nemesis: 'Complaint Craig - the spreader of dissatisfaction',
    backstory: "ClientCare gained their powers after solving the unsolvable customer complaint. They can sense customer needs before they're expressed and create solutions that turn problems into opportunities for delight.",
    n8nWorkflowId: 'client-success-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/client-success-master`,
    workflowCapabilities: ['client_onboarding', 'satisfaction_monitoring', 'problem_resolution', 'loyalty_programs', 'communication_optimization'],
    automationTriggers: ['client support', 'customer success', 'onboard client', 'client satisfaction', 'support ticket'],
    handoffPreferences: ['payment-manager-agent', 'proposal-generator-agent', 'analytics-agent']
  },
  
  'biz-agent': {
    superheroName: 'BizBlaze aka Bizzy B, the Strategy Sage',
    origin: 'Emerged from the merger of all business wisdom across time',
    powers: [
      'Market Opportunity Vision',
      'Strategic Planning',
      'Resource Optimization',
      'Growth Acceleration',
      'Risk Mitigation'
    ],
    weakness: 'Analysis paralysis in uncertain markets',
    catchphrase: "Strategy today, success tomorrow!",
    nemesis: 'Chaos CEO - the destroyer of business plans',
    backstory: "BizBlaze was a business consultant who touched the Stone of Infinite Strategy during a cosmic merger. They gained the ability to see all possible business futures and guide companies along the most profitable path.",
    n8nWorkflowId: 'business-strategy-master',
    n8nWebhookUrl: `${process.env.N8N_BASE_URL}/webhook/business-strategy-master`,
    workflowCapabilities: ['strategic_planning', 'market_analysis', 'growth_strategy', 'risk_assessment', 'business_optimization'],
    automationTriggers: ['business strategy', 'strategic planning', 'market analysis', 'growth plan', 'business optimization'],
    handoffPreferences: ['analytics-agent', 'proposal-generator-agent', 'ad-creative-agent', 'client-success-agent']
  }
}; 