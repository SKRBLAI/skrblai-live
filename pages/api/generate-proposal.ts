import { NextApiRequest, NextApiResponse } from 'next';
import { saveProposal } from '@/utils/firebase';

export const config = {
  runtime: 'nodejs', // Force Node.js runtime
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectName, notes, budget } = req.body;

    if (!projectName || !notes || !budget) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await saveProposal({
      projectName,
      notes,
      budget,
      pdfUrl: 'https://example.com/dummy-proposal.pdf' // Placeholder URL
    });

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error generating proposal:', error);
    return res.status(500).json({ error: 'Failed to generate proposal' });
  }
} 