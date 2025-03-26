import { NextApiRequest, NextApiResponse } from 'next';
import { saveScheduledPost } from '@/utils/firebase';

export const config = {
  runtime: 'nodejs', // Force Node.js runtime
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { platform, postDate, description } = req.body;

    if (!platform || !postDate || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await saveScheduledPost({
      platform,
      postDate,
      description,
      status: 'scheduled'
    });

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error scheduling post:', error);
    return res.status(500).json({ error: 'Failed to schedule post' });
  }
} 