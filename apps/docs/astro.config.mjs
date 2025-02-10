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
      customCss: [
        './src/styles/custom.css',
      ],
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
            { label: 'Overview', link: '/plugins/overview' },
            { label: 'Fraxlend', link: '/plugins/fraxlend' },
            { label: 'Odos', link: '/plugins/odos' },
          ],
        },
      ],
    }),
  ],
});