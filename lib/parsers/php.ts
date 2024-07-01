import { Parser } from "./types";

const parse: Parser = (data) => {
  return data
    .flatMap((datum) => datum.data)
    .find((d) => d.type === "text/headers/set-cookie")
    ?.value.includes("PHPSESSID")
    ? [
        {
          label: "SERVICE",
          metadata: {
            genre: "backend",
            value: "PHP",
          },
        },
      ]
    : [];
};

const exports = { parse };
export default exports;
