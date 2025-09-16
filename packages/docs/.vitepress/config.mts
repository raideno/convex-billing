import { defineConfig, Plugin } from "vitepress";
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from "vitepress-plugin-group-icons";

export default defineConfig({
  base: "/convex-stripe/",
  title: "convex-stripe",
  description: "Convex stripe integration to sync stripe tables.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "References", link: "/references" },
      { text: "Demo", link: "https://convex-stripe-demo.vercel.app/" },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/raideno/convex-stripe" },
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
