import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  dangerous: {
    esbuild: {
      external: ["pg-cloudflare"]
    },
  },
} as any);