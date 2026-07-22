import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {sentryReactRouter, type SentryReactRouterBuildOptions} from "@sentry/react-router";
import path from "path";

const sentryConfig: SentryReactRouterBuildOptions = {
  org: "parsa-technology",
  project: "4511780429299792",
  authToken: "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"
  // ...
};

export default defineConfig(config => {
  return {
    plugins: [tailwindcss(), tsconfigPaths(), reactRouter(), sentryReactRouter(sentryConfig, config)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    sentryConfig,
    ssr: {
      noExternal: []
    }
  };
});
