import { defineConfig, Plugin } from "vitepress";
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from "vitepress-plugin-group-icons";

export default defineConfig({
  base: "/convex-billing/",
  title: "convex-billing",
  description: "Convex billing integration with stripe.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "References", link: "/references" },
      { text: "Demo", link: "https://convex-billing-demo.vercel.app/" },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/raideno/convex-billing" },
    ],
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin() as Plugin],
  },
});
