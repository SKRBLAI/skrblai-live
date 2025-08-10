import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Basic static entries; dynamic agent entries can be added via build-time registry if needed
  const items: MetadataRoute.Sitemap = [
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
  // Add common agents we ship (fallback; full dynamic can iterate registry)
  const defaultAgents = ['percy', 'skillsmith'];
  defaultAgents.forEach(a => {
    items.push({ url: `https://skrblai.io/agents/${a}`, lastModified: new Date() });
  });
  return items;
} 