import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  dangerous: {
    buildConfig: {
      external: ["pg-cloudflare"]
    },
  },
} as any);