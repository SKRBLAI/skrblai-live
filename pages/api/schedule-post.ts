import { saveScheduledPost } from '@/utils/supabase-helpers';
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
    const { platform, postDate, description } = req.body;

    if (!platform || !postDate || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await saveScheduledPost({
      platform,
      postDate,
      description,
      status: 'pending'
    });

    if (!result.success) {
      throw new Error('Failed to schedule post');
    }

    return res.status(200).json({ success: true, postId: result.id });
  } catch (error) {
    console.error('Error in schedule-post:', error);
    return res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
} 