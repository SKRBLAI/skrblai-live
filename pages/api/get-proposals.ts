import { getProposals } from '@/utils/supabase-helpers';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  runtime: 'nodejs', // Force Node.js runtime
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const proposals = await getProposals();
    return res.status(200).json({ success: true, proposals });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
} 