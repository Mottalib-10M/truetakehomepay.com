// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://truetakehomepay.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/disclaimer') &&
        !page.includes('/privacy-policy') &&
        !page.includes('/terms-of-service') &&
        !page.includes('/widget'),
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