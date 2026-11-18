import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { TOPIC_GUIDES } from '@/lib/topicGuides';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const corePages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/chat`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/debate`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/question-lab`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/coach`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about/liz-stein`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/analytics`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ];

  const guidePages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/learn`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...TOPIC_GUIDES.map((guide) => ({
      url: `${SITE_URL}/learn/${guide.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ];

  return [...corePages, ...guidePages];
}
