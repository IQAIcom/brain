// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import vercel from '@astrojs/vercel';

export default defineConfig({
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
      components: {
        PageSidebar: './src/components/starlight/page-sidebar.astro',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: '📖 Overview', link: '/getting-started/overview' },
            { label: '⚡ Quick Start', link: '/getting-started/quickstart' },
          ],
        },
        {
          label: 'Development Guide',
          items: [
            { label: '🤖 Agent Creation', link: '/getting-started/agent-creation' },
            { label: '🔌 Creating plugins', link: '/getting-started/creating-plugins' },
            { label: '🧪 Test your agent', link: '/getting-started/test-agent' },
            { label: '🚀 Deploy your agent', link: '/getting-started/deployment' },
          ],
        },
        {
          label: 'Plugins',
          items: [
            { label: '📚 Overview', link: '/plugins/overview' },
            { label: '💰 Fraxlend', link: '/plugins/fraxlend' },
            { label: '🔄 Odos', link: '/plugins/odos' },
            { label: "⚡ ATP", link: "/plugins/atp"},
            { label: "💰 BAMM", link: "/plugins/bamm"},
            { label: "💓 Heartbeat", link: "/plugins/heartbeat"},
            { label: "📝 Sequencer", link: "/plugins/sequencer"},
          ],
        }
      ],
    }),
  ],
});