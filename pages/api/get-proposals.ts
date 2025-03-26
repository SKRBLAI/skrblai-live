import { NextApiRequest, NextApiResponse } from 'next';
import { getProposals } from '@/utils/firebase';

export const config = {
  runtime: 'nodejs', // Force Node.js runtime
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const proposals = await getProposals();
    return res.status(200).json({ proposals });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return res.status(500).json({ error: 'Failed to fetch proposals' });
  }
} 