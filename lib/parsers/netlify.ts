import { Parser } from "./types";

const parse: Parser = (data) => {
  return data
    .flatMap((datum) => datum.data)
    .find((d) => d.type === "text/headers/server")?.value === "Netlify"
    ? [
        {
          label: "SERVICE",
          metadata: {
            value: "Netlify",
            genre: "backend",
          },
        },
      ]
    : [];
};

const exports = { parse };
export default exports;
