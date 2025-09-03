import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/convex-billing/",
  title: "convex-billing",
  description: "Convex billing integration with stripe.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guides", link: "/guides" },
      { text: "Demo", link: "/demo/" },
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
          { text: "User Based Billing", link: "/guides/user-based-billing" },
          {
            text: "Organization Based Billing",
            link: "/guides/organization-based-billing",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/raideno/convex-billing" },
    ],
  },
});
