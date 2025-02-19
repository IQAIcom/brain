// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    imageService:true
  }),
  integrations: [
    starlight({
      title: 'Brain Framework',
      head: [
        {
          tag: 'script',
          content: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
                    posthog.init(
                                  '${import.meta.env.PUBLIC_POSTHOG_KEY}',
                                  {
                                    api_host:'https://us.i.posthog.com'
                                  }
                                )`
        }
      ],
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
            { label: "💓 Heartbeat", link: "/plugins/heartbeat"},
            { label: "📝 Sequencer", link: "/plugins/sequencer"},
          ],
        }
      ],
    }),
  ],
});