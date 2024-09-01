import { Parser } from "./types";

const parse: Parser = (data) => {
    return data
        .flatMap((datum) => datum.data)
        .find((d) => d.type === "text/headers/fly-request-id")
        ? [
            {
                label: "SERVICE",
                metadata: {
                    genre: "backend",
                    value: "fly_io",
                },
            },
        ]
        : [];
};

const exports = { parse };
export default exports;
