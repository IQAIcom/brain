import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	sourcemap: true,
	clean: true,
	format: ["esm"],
	dts: true,
	external: [
		"dotenv",
		"fs",
		"path",
		"@reflink/reflink",
		"@node-llama-cpp",
		"https",
		"http",
		"agentkeepalive",
		"viem",
		"@lifi/sdk",
		"gql.tada",
		"graphql",
		"graphql-request",
		"@elizaos/core",
	],
});
