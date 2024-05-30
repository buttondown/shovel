import { Parser } from "./types";

const parse: Parser = (data) => {
  return data
    .flatMap((datum) => datum.data)
    .find((d) => d.type === "text/headers/fly-request-id")
    ? [
        {
          label: "BACKEND",
          metadata: {
            value: "Fly.io",
          },
        },
      ]
    : [];
};

const exports = { parse };
export default exports;
