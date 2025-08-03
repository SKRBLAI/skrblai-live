interface EmailTemplate {
  to: string;
  subject: string;
  htmlContent: string;
  attachments?: {
    filename: string;
    content: string; // base64 encoded
    type: string;
  }[];
}

interface SkillSmithAnalysisEmail {
  userEmail: string;
  playerName?: string;
  sport: string;
  overallScore: number;
  analysisDate: string;
  ageGroup?: string;
  pdfContent?: string; // base64 encoded PDF
}

export const sendSkillSmithAnalysisEmail = async (emailData: SkillSmithAnalysisEmail): Promise<boolean> => {
  const ageGroupGreeting = getAgeGroupGreeting(emailData.ageGroup);
  const scoreEmoji = getScoreEmoji(emailData.overallScore);
  
  const emailTemplate: EmailTemplate = {
    to: emailData.userEmail,
    subject: `${scoreEmoji} Your SkillSmith ${emailData.sport} Analysis is Ready!`,
    htmlContent: generateEmailHTML(emailData, ageGroupGreeting),
    attachments: emailData.pdfContent ? [{
      filename: `SkillSmith_${emailData.sport}_Analysis_${emailData.analysisDate.replace(/\//g, '-')}.pdf`,
      content: emailData.pdfContent,
      type: 'application/pdf'
    }] : undefined
  };

  try {
    // In production, this would use a service like SendGrid, Mailgun, or AWS SES
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailTemplate),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send SkillSmith analysis email:', error);
    return false;
  }
};

const getAgeGroupGreeting = (ageGroup?: string): string => {
  switch (ageGroup) {
    case 'youth':
      return 'Hey there, superstar! 🌟';
    case 'teen':
      return 'What\'s up, athlete! 💪';
    case 'adult':
      return 'Hello there!';
    case 'senior':
      return 'Greetings!';
    default:
      return 'Hello!';
  }
};

const getScoreEmoji = (score: number): string => {
  if (score >= 90) return '🏆';
  if (score >= 80) return '🔥';
  if (score >= 70) return '⚡';
  if (score >= 60) return '💪';
  return '🚀';
};

const generateEmailHTML = (emailData: SkillSmithAnalysisEmail, greeting: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Your SkillSmith Analysis</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #f97316, #ef4444);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.9;
        }
        .score-section {
            background: #fef3e2;
            border: 2px solid #f97316;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin-bottom: 25px;
        }
        .score {
            font-size: 48px;
            font-weight: bold;
            color: #ef4444;
            margin: 10px 0;
        }
        .score-label {
            color: #9ca3af;
            font-size: 14px;
        }
        .section {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .section-title {
            color: #f97316;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #f97316, #ef4444);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            color: #f97316;
            margin: 0 10px;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">SkillSmith</div>
        <div class="tagline">AI-Powered Sports Performance Analysis</div>
    </div>
    
    <h2>${greeting}</h2>
    
    <p>Your AI-powered ${emailData.sport} analysis is complete! ${emailData.playerName ? `${emailData.playerName}, ` : ''}I've analyzed your performance and created a personalized improvement plan just for you.</p>
    
    <div class="score-section">
        <div class="score-label">Your Performance Score</div>
        <div class="score">${emailData.overallScore}/100</div>
        <div class="score-label">${getScoreDescription(emailData.overallScore)}</div>
    </div>
    
    <div class="section">
        <div class="section-title">📊 What's in Your Analysis</div>
        <ul>
            <li><strong>Technique Breakdown:</strong> Frame-by-frame analysis of your form</li>
            <li><strong>Strength Assessment:</strong> What you're already doing great</li>
            <li><strong>Improvement Areas:</strong> Specific areas to focus on</li>
            <li><strong>Quick Fixes:</strong> Immediate improvements you can make today</li>
            <li><strong>Training Plan:</strong> Step-by-step guidance for the next level</li>
        </ul>
    </div>
    
    <div class="section">
        <div class="section-title">🎯 Your Next Steps</div>
        <p>1. Download your detailed analysis PDF (attached)</p>
        <p>2. Practice the quick fixes for immediate improvement</p>
        <p>3. Follow your personalized training plan</p>
        <p>4. Upload another video in 1-2 weeks to track progress</p>
    </div>
    
    <div style="text-align: center;">
        <a href="https://skrblai.io/sports" class="cta-button">
            🚀 Continue Your Journey
        </a>
    </div>
    
    <div class="section">
        <div class="section-title">💡 Pro Tip</div>
        <p>Share your progress on social media and tag us! We love seeing athletes improve with SkillSmith AI. Use #SkillSmithAI to connect with other athletes on their journey!</p>
    </div>
    
    <div class="social-links">
        <a href="https://twitter.com/skrblai">Twitter</a> |
        <a href="https://instagram.com/skrblai">Instagram</a> |
        <a href="https://reddit.com/r/skrblai">Reddit</a>
    </div>
    
    <div class="footer">
        <p>Keep crushing your goals! 🏆</p>
        <p>- The SkillSmith AI Team</p>
        <br>
        <p>Generated on ${emailData.analysisDate} • <a href="https://skrblai.io/sports">skrblai.io/sports</a></p>
        <p>Questions? Reply to this email or contact us at support@skrblai.io</p>
    </div>
</body>
</html>
  `;
};

const getScoreDescription = (score: number): string => {
  if (score >= 90) return 'Elite Performance 🏆';
  if (score >= 80) return 'Advanced Skill Level 🔥';
  if (score >= 70) return 'Good Foundation ⚡';
  if (score >= 60) return 'Developing Skills 💪';
  return 'Beginner Level - Great Start! 🚀';
};
