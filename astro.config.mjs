// @ts-check
import { defineConfig } from 'astro/config';
import trustKit from './src/integrations/trust-kit.mjs';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://truetakehomepay.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    trustKit({ lang: 'en', siteUrl: 'https://truetakehomepay.com', siteName: 'TrueTakeHomePay', founded: '2026-06-27', about: '/about/', method: '/methodology/' }),
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/disclaimer') &&
        !page.includes('/privacy-policy') &&
        !page.includes('/terms-of-service') &&
        !page.includes('/widget') &&
        !page.includes('/legal') &&
        !page.includes('/404'),
      changefreq: 'monthly',
      priority: 0.7,
      serialize: (item) => ({
        ...item,
        lastmod: '2026-07-09',
      }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});