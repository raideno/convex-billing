import { defineConfig, Plugin } from "vitepress";
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
  localIconLoader,
} from "vitepress-plugin-group-icons";

export default defineConfig({
  base: "/convex-stripe/",
  title: "convex-stripe",
  description: "Convex stripe integration to sync stripe tables.",
  themeConfig: {
    outline: {
      level: [2, 3],
    },
    nav: [
      { text: "Home", link: "/" },
      { text: "References", link: "/references/configuration" },
      { text: "Examples", link: "/examples/organization-billing" },
      { text: "Demo", link: "https://convex-stripe-demo.vercel.app/" },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/raideno/convex-stripe" },
    ],
    sidebar: {
      "/references/": [
        {
          text: "References",
          collapsed: false,
          items: [
            { text: "Configuration", link: "/references/configuration" },
            { text: "Tables", link: "/references/tables" },
            { text: "Webhook Events", link: "/references/events" },
          ],
        },
      ],
      "/examples/": [
        {
          text: "Examples",
          collapsed: false,
          items: [
            { text: "User Billing", link: "/examples/user-billing" },
            {
              text: "Organization Billing",
              link: "/examples/organization-billing",
            },
          ],
        },
      ],
    },
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          convex: localIconLoader(import.meta.url, "./assets/convex.svg.txt"),
          clerk: localIconLoader(import.meta.url, "./assets/clerk.svg.txt"),
          "better-auth": localIconLoader(
            import.meta.url,
            "./assets/better-auth.svg.txt"
          ),
        },
      }) as Plugin,
    ],
  },
});
