// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://uspaycheck.com',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/disclaimer') &&
        !page.includes('/privacy-policy') &&
        !page.includes('/terms-of-service'),
      changefreq: 'monthly',
      priority: 0.7,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});