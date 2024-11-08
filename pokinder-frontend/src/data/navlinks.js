import { MODE_POKEDEX } from "../page/Explore/Explore";

export const navlinks = (t) => [
  {
    title: t("Vote"),
    path: "/",
  },
  {
    title: t("Explore"),
    path: `/explore?mode=${MODE_POKEDEX}`,
  },
  {
    title: t("Analytics"),
    path: "/analytics",
  },
  {
    title: t("Admin"),
    path: "/admin",
    admin: true,
  },
];

export const authorizedNavlinks = (t, isAdmin) => {
  return navlinks(t).filter((navlink) => (isAdmin ? true : !(navlink.admin === true)));
};
