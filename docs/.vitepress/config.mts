import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/convex-billing",
  title: "convex-billing",
  description: "Convex billing integration with stripe.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/examples" },
    ],

    sidebar: [
      {
        text: "Installation",
        items: [{ text: "Get Started", link: "/" }],
      },
      {
        text: "Examples",
        link: "/examples",
        items: [
          { text: "First Examples", link: "/examples/first" },
          { text: "Second Examples", link: "/examples/second" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/raideno/convex-billing" },
    ],
  },
});
