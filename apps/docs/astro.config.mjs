import starlight from "@astrojs/starlight";
import vercel from "@astrojs/vercel";
// @ts-check
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";

export default defineConfig({
	adapter: vercel({
		imageService: true,
	}),
	integrations: [
		starlight({
			title: "Brain Framework",
			plugins: [starlightLinksValidator()],
			head: [
				// {
				// 	tag: "meta",
				// 	attrs: {
				// 		property: "og:image",
				// 		content:
				// 			"https://brain-docs-git-og-image-prediqt.vercel.app/og-image.png",
				// 	},
				// },
				// {
				// 	tag: "meta",
				// 	attrs: {
				// 		name: "twitter:card",
				// 		content: "summary_large_image",
				// 		property: "og:image",
				// 	},
				// },
				// {
				// 	tag: "meta",
				// 	attrs: {
				// 		name: "twitter:image",
				// 		content:
				// 			"https://brain-docs-git-og-image-prediqt.vercel.app/og-image.png",
				// 	},
				// },
				{
					tag: "script",
					content: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src="/ingest/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_LLkbzwgpIHtvR0dKql3ByGbNpzBFiTspaSa4AEzL3uU', {
              api_host: '/ingest',
              person_profiles: 'identified_only',
            })
          `,
				},
			],
			logo: {
				dark: "./src/assets/brain-logo-dark.svg",
				light: "./src/assets/brain-logo-light.svg",
				replacesTitle: true,
			},
			customCss: ["./src/styles/custom.css"],
			social: {
				github: "https://github.com/IQAIcom/brain",
			},
			editLink: {
				baseUrl: "https://github.com/IQAIcom/brain/edit/main/apps/docs/",
			},
			components: {
				PageSidebar: "./src/components/starlight/page-sidebar.astro",
			},
			sidebar: [
				{
					label: "Getting Started",
					items: [
						{ label: "📖 Overview", link: "/getting-started/overview" },
						{ label: "⚡ Quick Start", link: "/getting-started/quickstart" },
					],
				},
				{
					label: "Development Guide",
					items: [
						{
							label: "🤖 Agent Creation",
							link: "/getting-started/agent-creation",
						},
						{
							label: "🔌 Creating plugins",
							link: "/getting-started/creating-plugins",
						},
						{
							label: "🧪 Test your agent",
							link: "/getting-started/test-agent",
						},
						{
							label: "🚀 Deploy your agent",
							link: "/getting-started/deployment",
						},
						{
							label: "🤖 Example agents",
							link: "/getting-started/example-agents",
						},
					],
				},
				{
					label: "Plugins",
					items: [
						{ label: "📚 Overview", link: "/plugins/overview" },
						{ label: "🔗 ABI", link: "/plugins/abi" },
						{ label: "💫 Near", link: "/plugins/near" },
						{ label: "💰 Fraxlend", link: "/plugins/fraxlend" },
						{ label: "🔄 Odos", link: "/plugins/odos" },
						{ label: "📜 Wiki", link: "/plugins/wiki" },
						{ label: "⚡ ATP", link: "/plugins/atp" },
						{ label: "💰 BAMM", link: "/plugins/bamm" },
						{ label: "💓 Heartbeat", link: "/plugins/heartbeat" },
						{ label: "📝 Sequencer", link: "/plugins/sequencer" },
						{ label: "🔧 Bootstrap", link: "/plugins/bootstrap" },
						{ label: "🎨 Images", link: "/plugins/image-gen" },
						{ label: "📦 Node", link: "/plugins/node" },
						{ label: "⛓️ Solana", link: "/plugins/solana" },
						{ label: "🔌 MCP", link: "/plugins/mcp" },
						{ label: "💰 Wallet", link: "/plugins/wallet" },
					],
				},
				{
					label: "Clients",
					items: [
						{ label: "💬 Discord", link: "/clients/discord" },
						{ label: "📱 Telegram", link: "/clients/telegram" },
						{ label: "🪶 Twitter", link: "/clients/twitter" },
					],
				},
				{
					label: "Database Adapters",
					items: [
						{ label: "🗃️ SQLite", link: "/adapters/sqlite" },
						{ label: "🐘 Postgres", link: "/adapters/postgres" },
					],
				},
			],
		}),
	],
});
