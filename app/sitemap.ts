import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://skrblai.io',
      lastModified: new Date(),
    },
    {
      url: 'https://skrblai.io/pricing',
      lastModified: new Date(),
    },
    {
      url: 'https://skrblai.io/dashboard',
      lastModified: new Date(),
    },
    {
      url: 'https://skrblai.io/contact',
      lastModified: new Date(),
    },
    {
      url: 'https://skrblai.io/blog',
      lastModified: new Date(),
    },
  ];
} 