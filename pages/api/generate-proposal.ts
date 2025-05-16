import { saveProposal } from '@/utils/supabase-helpers';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  runtime: 'nodejs', // Force Node.js runtime
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Destructure and allow notes to be optional
    const { projectName, notes, budget, pdfUrl } = req.body;

    // Validate required fields
    if (!projectName || !budget || !pdfUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure notes is a string (or empty string by default)
    const result = await saveProposal({
      projectName,
      notes: typeof notes === 'string' ? notes : '',
      budget,
      pdfUrl
    });

    if (!result.success) {
      throw new Error('Failed to save proposal');
    }

    return res.status(200).json({ success: true, proposalId: result.id });
  } catch (error) {
    console.error('Error in generate-proposal:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
}
