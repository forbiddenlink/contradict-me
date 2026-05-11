/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://contradict-me-elizabeth-emersons-projects.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
}
