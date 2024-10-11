export const navlinks = (t) => [
  {
    title: t("Vote"),
    path: "/",
  },
  {
    title: t("History"),
    path: "/history",
  },
  {
    title: t("Ranking"),
    path: "/ranking",
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
