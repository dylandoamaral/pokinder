import oak from "./oak.png";

function collect(modules) {
  return Object.fromEntries(
    Object.entries(modules).map(([path, url]) => [
      path.split("/").pop().replace(/\.\w+$/, ""),
      url,
    ]),
  );
}

export const balls = collect(
  import.meta.glob("./ball/*.svg", { eager: true, query: "?url", import: "default" }),
);

export const types = collect(
  import.meta.glob("./type/*.png", { eager: true, query: "?url", import: "default" }),
);

export const icons = collect(
  import.meta.glob("./icon/*.ico", { eager: true, query: "?url", import: "default" }),
);

export { oak };
