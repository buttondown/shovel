import { Parser } from "./types";

const parse: Parser = (data) => {
    return data
        .flatMap((datum) => datum.data)
        .find(
            (d) => d.type === "text/headers/nel" && d.value.includes("heroku-nel")
        )
        ? [
            {
                label: "SERVICE",
                metadata: {
                    genre: "hosting",
                    value: "heroku",
                },
            },
        ]
        : [];
};

const exports = { parse };
export default exports;
