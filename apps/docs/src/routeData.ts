import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
	const ogImageUrl = new URL("/og-image.png", context.site);

	const { head } = context.locals.starlightRoute;

	head.push({
		tag: "meta",
		attrs: {
			property: "og:image",
			content: ogImageUrl.href,
			width: 1200,
			height: 630,
		},
	});
	head.push({
		tag: "meta",
		attrs: {
			name: "twitter:image",
			url: ogImageUrl.href,
			width: 1200,
			height: 630,
		},
	});
});
