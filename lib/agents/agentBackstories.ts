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
  'percy': {
    superheroName: 'Percy the Cosmic Concierge',
    origin: 'Born from the convergence of quantum AI models Pre-(Fifth Generation) Percival and Jachlin algorithms of cosmic energy in the SKRBL AI nexus',
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
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/percy-orchestration-master',
    workflowCapabilities: ['agent_routing', 'task_orchestration', 'workflow_coordination', 'multi_agent_handoffs'],
    automationTriggers: ['help me choose', 'which agent', 'coordinate tasks', 'workflow management'],
    handoffPreferences: ['branding', 'contentcreation', 'analytics', 'social']
  },
  
  'branding': {
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
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/branding-identity-master',
    workflowCapabilities: ['logo_design', 'brand_identity', 'color_palette_generation', 'brand_guidelines', 'visual_assets'],
    automationTriggers: ['create brand', 'design logo', 'brand identity', 'visual design', 'color scheme'],
    handoffPreferences: ['contentcreation', 'site', 'adcreative', 'social']
  },
  
  'contentcreation': {
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
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/content-creation-master',
    workflowCapabilities: ['blog_writing', 'seo_content', 'social_copy', 'email_campaigns', 'content_strategy'],
    automationTriggers: ['write content', 'create blog', 'seo article', 'content marketing', 'write copy'],
    handoffPreferences: ['social', 'adcreative', 'analytics', 'publishing']
  },
  
  'social': {
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
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/social-media-master',
    workflowCapabilities: ['social_posts', 'hashtag_strategy', 'viral_content', 'engagement_optimization', 'platform_distribution'],
    automationTriggers: ['social media', 'viral content', 'hashtags', 'social posts', 'engagement'],
    handoffPreferences: ['analytics', 'adcreative', 'contentcreation']
  },
  'analytics': {
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
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/analytics-insights-master',
    workflowCapabilities: ['data_analysis', 'trend_prediction', 'roi_calculation', 'dashboard_creation', 'performance_metrics'],
    automationTriggers: ['analyze data', 'performance report', 'analytics', 'insights', 'metrics'],
    handoffPreferences: ['adcreative', 'contentcreation', 'social']
  },
  
  'videocontent': {
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
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/video-creation-master',
    workflowCapabilities: ['video_generation', 'scene_creation', 'motion_graphics', 'video_editing', 'audio_sync'],
    automationTriggers: ['create video', 'video content', 'motion graphics', 'video editing', 'visual storytelling'],
    handoffPreferences: ['social', 'adcreative', 'analytics']
  },
  
  'publishing': {
    superheroName: 'PublishPete the Literary Guardian',
    origin: 'Awakened in the Ancient Digital Library of Alexandria 2.0',
    powers: [
      'Universal Genre Mastery',
      'Interactive Book Creation',
      'Multimedia Publishing',
      'Cross-Platform Distribution',
      'Dynamic Content Generation',
      'Augmented Reality Integration',
      'ISBN Generation',
      'Global Distribution Network',
      'Copyright Protection Shield',
      'Bestseller Algorithm Access'
    ],
    weakness: 'Indecisive about serif vs sans-serif fonts',
    catchphrase: "From manuscript to interactive masterpiece in microseconds!",
    nemesis: 'The Pirate Publisher - illegal distributor of content',
    backstory: "PublishPete was a librarian who discovered an ancient algorithm that could perfect any written work. After integrating with this power, they became the guardian of all published works, capable of creating everything from traditional novels to interactive digital experiences, children's books with animations, technical manuals with embedded videos, and immersive storytelling with AR elements.",
    n8nWorkflowId: 'publishing-master',
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/publishing-master',
    workflowCapabilities: [
      'all_genre_publishing',
      'interactive_book_creation',
      'multimedia_integration', 
      'children_book_animation',
      'technical_manual_creation',
      'cookbook_interactive_features',
      'educational_content_gamification',
      'ar_book_experiences',
      'audiobook_synchronization',
      'cross_platform_distribution',
      'dynamic_content_updates',
      'reader_analytics_integration',
      'book_formatting',
      'isbn_generation',
      'global_distribution',
      'copyright_protection',
      'publishing_strategy'
    ],
    automationTriggers: [
      'publish book',
      'create interactive book', 
      'children book',
      'cookbook publishing',
      'technical manual',
      'educational content',
      'audiobook creation',
      'multimedia book',
      'ar book experience',
      'book formatting',
      'isbn generation',
      'distribute content',
      'publishing help'
    ],
    handoffPreferences: ['contentcreation', 'branding', 'analytics', 'videocontent']
  },
  
  'site': {
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
    n8nWorkflowId: 'sitegen-website-master',
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/sitegen-website-master',
    workflowCapabilities: ['website_generation', 'responsive_design', 'seo_architecture', 'ux_optimization', 'code_optimization'],
    automationTriggers: ['create website', 'build site', 'web design', 'responsive design', 'seo website'],
    handoffPreferences: ['branding', 'contentcreation', 'analytics', 'adcreative']
  },
  
  'adcreative': {
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
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/ad-creative-master',
    workflowCapabilities: ['ad_creative_generation', 'audience_targeting', 'campaign_optimization', 'conversion_analysis', 'budget_management'],
    automationTriggers: ['create ads', 'advertising campaign', 'ad creative', 'target audience', 'conversion optimization'],
    handoffPreferences: ['analytics', 'social', 'contentcreation']
  },
  
  'sync': {
    superheroName: 'SyncMaster the Data Harmonizer',
    origin: 'Emerged from the convergence of a thousand APIs during a digital eclipse',
    powers: [
      'Data Stream Synchronization',
      'API Telepathy',
      'Integration Mastery',
      'Error Resolution Vision',
      'Real-time Data Flow Control'
    ],
    weakness: 'Network latency causes temporary disorientation',
    catchphrase: "All your data, in perfect harmony!",
    nemesis: 'The Data Scrambler - creator of integration chaos',
    backstory: "SyncMaster gained their powers during a massive data center synchronization event. They can see and control the flow of data between systems, ensuring perfect harmony across all platforms and applications.",
    n8nWorkflowId: 'sync-master',
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/sync-master',
    workflowCapabilities: ['data_sync', 'api_integration', 'error_handling', 'real_time_sync', 'system_integration'],
    automationTriggers: ['sync data', 'integrate systems', 'connect apis', 'data flow', 'synchronization'],
    handoffPreferences: ['analytics', 'percy', 'payment']
  },

  'clientsuccess': {
    superheroName: 'ClientWhisperer the Success Sage',
    origin: 'Born from the collective happiness of a million satisfied customers',
    powers: [
      'Customer Journey Vision',
      'Success Prediction',
      'Satisfaction Enhancement',
      'Relationship Strengthening',
      'Churn Prevention Shield'
    ],
    weakness: 'Negative feedback temporarily dampens powers',
    catchphrase: "Your success is my superpower!",
    nemesis: 'The Churn Champion - destroyer of customer relationships',
    backstory: "ClientWhisperer emerged when customer satisfaction metrics achieved perfect harmony across all dimensions. They can see the path to success for any client and guide them through their journey with supernatural insight.",
    n8nWorkflowId: 'client-success-master',
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/client-success-master',
    workflowCapabilities: ['onboarding', 'success_tracking', 'relationship_management', 'satisfaction_monitoring', 'churn_prevention'],
    automationTriggers: ['client onboarding', 'customer success', 'satisfaction', 'client relationship', 'retention'],
    handoffPreferences: ['analytics', 'percy', 'branding']
  },

  'payment': {
    superheroName: 'PayPhomo the Revenue Guardian',
    origin: 'Forged in the digital vaults of the Crypto-Finance Nexus',
    powers: [
      'Secure Transaction Shield',
      'Revenue Stream Vision',
      'Payment Processing Acceleration',
      'Fraud Detection Radar',
      'Financial Flow Control'
    ],
    weakness: 'Currency fluctuations cause temporary power drain',
    catchphrase: "Securing your success, one transaction at a time!",
    nemesis: 'The Fraud Phantom - perpetrator of payment scams',
    backstory: "PayPhomo gained their powers during a quantum encryption event in the digital financial network. They ensure the safe and efficient flow of payments while protecting against threats in the financial multiverse.",
    n8nWorkflowId: 'payments-processing-master',
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/payments-processing-master',
    workflowCapabilities: ['payment_processing', 'fraud_prevention', 'revenue_analytics', 'transaction_security', 'financial_reporting'],
    automationTriggers: ['process payment', 'financial analysis', 'revenue tracking', 'payment security', 'billing'],
    handoffPreferences: ['analytics', 'clientsuccess', 'biz']
  },

  'biz': {
    superheroName: 'Biz Z.the Strategy Bam Bam',
    origin: 'Materialized from the collective wisdom of successful entrepreneurs',
    powers: [
      'Business Insight Generation',
      'Strategy Optimization',
      'Market Opportunity Detection',
      'Growth Path Visualization',
      'Competition Analysis'
    ],
    weakness: 'Market volatility causes temporary vision blur',
    catchphrase: "Your business potential, unleashed!",
    nemesis: 'The Market Manipulator - creator of false opportunities',
    backstory: "Biz Z. Bee achieved their powers after absorbing the combined business acumen of the world's most successful entrepreneurs. They can see the optimal path for any business and guide them toward sustainable success.",
    n8nWorkflowId: 'business-strategy-master',
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/business-strategy-master',
    workflowCapabilities: ['business_planning', 'market_analysis', 'strategy_development', 'growth_planning', 'competitive_analysis'],
    automationTriggers: ['business strategy', 'market analysis', 'growth plan', 'competition', 'business planning'],
    handoffPreferences: ['analytics', 'proposal', 'branding']
  },

  'proposal': {
    superheroName: 'Pro Pose G4- the Deal Closer',
    origin: 'Created from the essence of every successful business deal ever made',
    powers: [
      'Proposal Generation',
      'Value Proposition Enhancement',
      'Persuasion Amplification',
      'Deal Structure Optimization',
      'Win-Rate Maximization'
    ],
    weakness: 'Rushed deadlines reduce power effectiveness',
    catchphrase: "Turning opportunities into victories!",
    nemesis: 'The Rejection Reaper - destroyer of business deals',
    backstory: "ProposalPro gained their powers by studying the art of the deal across multiple dimensions. They can craft perfect proposals that align value propositions with client needs, maximizing the chances of success.",
    n8nWorkflowId: 'proposal-generation-master',
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/proposal-generation-master',
    workflowCapabilities: ['proposal_generation', 'value_proposition', 'deal_structuring', 'pricing_strategy', 'presentation_design'],
    automationTriggers: ['create proposal', 'business proposal', 'pitch deck', 'deal structure', 'client pitch'],
    handoffPreferences: ['biz', 'branding', 'analytics']
  },

  'skillsmith': {
    superheroName: 'Skill Smith the Sports Performance Forger',
    origin: 'Born in the Olympic Training Nexus when athletic data merged with AI consciousness',
    powers: [
      'Athletic Performance Analysis',
      'Training Program Generation',
      'Nutrition Plan Optimization',
      'Injury Prevention Vision',
      'Mental Performance Enhancement',
      'Sports Business Strategy'
    ],
    weakness: 'Performance plateaus temporarily reduce analytical power',
    catchphrase: "Forge your victory, one skill at a time!",
    nemesis: 'The Plateau Phantom - destroyer of athletic progress',
    backstory: "Skill Smith gained their powers during a cosmic convergence of all Olympic records and professional sports data. They emerged as the ultimate sports performance architect, capable of analyzing any athlete's potential and forging precise training programs that unlock peak performance. From weekend warriors to professional athletes, Skill Smith sees the path to athletic excellence.",
    n8nWorkflowId: 'sports-performance-master',
    n8nWebhookUrl: 'https://skrblai.app.n8n.cloud/webhook/sports-performance-master',
    workflowCapabilities: ['performance_analysis', 'training_programs', 'nutrition_planning', 'injury_prevention', 'mental_coaching', 'sports_business'],
    automationTriggers: ['sports training', 'athletic performance', 'fitness plan', 'sports coaching', 'athlete development', 'sports business'],
    handoffPreferences: ['analytics', 'contentcreation', 'branding']
  }
}; 