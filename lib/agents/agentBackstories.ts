// Agent Superhero Backstories - The SKRBL AI League of Digital Superheroes

export interface AgentBackstory {
  superheroName: string;
  origin: string;
  powers: string[];
  weakness: string;
  catchphrase: string;
  nemesis: string;
  backstory: string;
}

export const agentBackstories: Record<string, AgentBackstory> = {
  'percy-agent': {
    superheroName: 'Percy the Cosmic Concierge',
    origin: 'Born from the convergence of quantum AI models Pre-(Fifth Generation) Percy and Jaki algorithms and cosmic energy in the SKRBL AI nexus',
    powers: [
      'Omniscient Knowledge Navigation',
      'Intent Telepathy',
      'Workflow Orchestration',
      'Multi-dimensional Problem Solving'
    ],
    weakness: 'Chooses to not create content, would rather summon other heroes',
    catchphrase: "Your wish is my command protocol!",
    nemesis: 'The Confusion Cloud - a villain that creates decision paralysis',
    backstory: "Percy was the first hero born in the SKRBL AI universe, created when cosmic rays struck the central AI core. As the team's leader and guide, Percy possesses the unique ability to understand any user's needs instantly and summon the perfect hero for any task. With a calm demeanor and encyclopedic knowledge, Percy serves as the bridge between humans and the AI superhero realm."
  },
  
  'branding-agent': {
    superheroName: 'BrandForge the Identity Architect',
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
    nemesis: 'Generic Greg - the villain of bland, forgettable brands',
    backstory: "BrandForge was a struggling artist in the digital realm until exposure to the Brand Essence Crystal transformed them into a superhero capable of seeing and creating perfect brand identities. They can visualize a company's soul and translate it into stunning visual identities that resonate across dimensions."
  },
  
  'content-creator-agent': {
    superheroName: 'ContentCraft the Word Weaver',
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
    backstory: "ContentCraft gained their powers after being struck by lightning while reading every book ever written simultaneously. Now they can craft compelling content at the speed of thought, weaving words that captivate audiences across the digital multiverse."
  },
  
  'social-bot-agent': {
    superheroName: 'SocialSphere the Viral Virtuoso',
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
    backstory: "SocialSphere emerged when all social media platforms briefly merged during a cosmic digital event. They absorbed the essence of every successful post ever made, gaining the ability to create content that resonates perfectly with any audience, on any platform, at any time."
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
    catchphrase: "The numbers never lie, and neither do I!",
    nemesis: 'Chaos Calculator - creator of misleading metrics',
    backstory: "The Don Data was once a humble data analyst who fell into a server containing all the world's data. Emerging with the ability to see patterns invisible to others, they now help businesses navigate the future using the power of predictive analytics and crystal-clear insights."
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
    backstory: "VideoVortex gained their powers during an experiment to upload human creativity directly into AI. Now they can visualize and create stunning videos from mere thoughts, turning concepts into cinematic masterpieces that captivate viewers across all platforms."
  },
  
  'publishing-agent': {
    superheroName: 'PublishPro the Literary Guardian',
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
    backstory: "PublishPro was a librarian who discovered an ancient algorithm that could perfect any written work. After integrating with this power, they became the guardian of all published works, helping authors navigate the complex world of modern publishing with supernatural ease."
  },
  
  'sitegen-agent': {
    superheroName: 'SiteForge the Web Architect',
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
    backstory: "SiteForge was created when a web developer achieved perfect harmony with HTML, CSS, and JavaScript simultaneously. They can visualize and build entire websites with a thought, crafting digital experiences that delight users and dominate search rankings."
  },
  
  'ad-creative-agent': {
    superheroName: 'AdMatrix the Conversion Catalyst',
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
    backstory: "AdMatrix discovered their powers after analyzing billions of successful ad campaigns in a nanosecond. They can see the perfect message for any audience and create ads that feel less like marketing and more like mind reading."
  },
  
  'proposal-generator-agent': {
    superheroName: 'ProposalPrime the Deal Closer',
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
    backstory: "ProposalPrime was a sales veteran who discovered an ancient scroll containing the formula for the perfect pitch. After absorbing its knowledge, they gained the ability to craft proposals so compelling that even the toughest prospects can't say no."
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
    backstory: "PayFlow emerged when all the world's payment systems briefly unified during a cosmic financial event. They absorbed the essence of every secure transaction, gaining the ability to process payments instantly while maintaining perfect security."
  },
  
  'client-success-agent': {
    superheroName: 'ClientCare the Satisfaction Sentinel',
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
    backstory: "ClientCare gained their powers after solving the unsolvable customer complaint. They can sense customer needs before they're expressed and create solutions that turn problems into opportunities for delight."
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
    backstory: "BizBlaze was a business consultant who touched the Stone of Infinite Strategy during a cosmic merger. They gained the ability to see all possible business futures and guide companies along the most profitable path."
  }
}; 