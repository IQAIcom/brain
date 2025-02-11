// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  adapter: vercel({
    imageService:true
  }),
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
      editLink: {
        baseUrl: 'https://github.com/IQAIcom/brain/edit/main/apps/docs/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'overview', link: '/getting-started/overview' },
            { label: 'Installation', link: '/getting-started/installation' },
            { label: 'Quick Start', link: '/getting-started/quickstart' },
            { label: 'Test your agent', link: '/getting-started/test-agent' },
          ],
        },
        {
          label: 'Plugins',
          items: [
            { label: 'Overview', link: '/plugins/overview' },
            { label: 'Fraxlend', link: '/plugins/fraxlend' },
            { label: 'Odos', link: '/plugins/odos' },
            {label: "ATP", link: "/plugins/atp"},
            {label: "Heartbeat", link: "/plugins/heartbeat"},
          ],
        }
      ],
    }),
  ],
});