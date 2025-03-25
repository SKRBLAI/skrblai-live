import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://skrbl.ai',
      lastModified: new Date(),
    },
    {
      url: 'https://skrbl.ai/pricing',
      lastModified: new Date(),
    },
    {
      url: 'https://skrbl.ai/dashboard',
      lastModified: new Date(),
    },
    {
      url: 'https://skrbl.ai/contact',
      lastModified: new Date(),
    },
    {
      url: 'https://skrbl.ai/blog',
      lastModified: new Date(),
    },
  ];
} 