import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/convex-billing",
  title: "convex-billing",
  rewrites: {
    "docs/:page.md": ":page.md", // move docs/*.md to root
    "docs/:dir/:page.md": ":dir/:page.md", // move docs/subdir/*.md up one level
  },
  description: "Convex billing integration with stripe.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guides", link: "/guides" },
    ],

    sidebar: [
      {
        text: "Installation",
        items: [{ text: "Get Started", link: "/" }],
      },
      {
        text: "Guides",
        link: "/guides",
        items: [
          { text: "First Guide", link: "/guides/first" },
          { text: "Second Guide", link: "/guides/second" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/raideno/convex-billing" },
    ],
  },
});
