import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    format: ["esm"],
    external: [
        "dotenv",
        "fs",
        "path",
        "@elizaos/client-direct",
        "@elizaos/client-telegram",
        "@elizaos/client-twitter",
        "@elizaos/core",
        "better-sqlite3"
    ],
    dts: true
});
