// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Brain Framework',
      logo: {
        dark: './src/assets/brain-logo-dark.svg',
        light: './src/assets/brain-logo-light.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/IQAIcom/brain',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', link: '/getting-started/installation' },
            { label: 'Quick Start', link: '/getting-started/quickstart' },
          ],
        },
        {
          label: 'Plugins',
          items: [
            { label: 'Plugins Overview', link: '/plugins/overview' },
            { label: 'Available Plugins', link: '/plugins/overview' },
          ],
        },
      ],
    }),
  ],
});