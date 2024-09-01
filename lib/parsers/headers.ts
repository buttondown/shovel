import { REGISTRY } from "../services";
import { Parser } from "./types";

const parse: Parser = (data) => {
    return data
        .flatMap((datum) => datum.data)
        .flatMap((d) => {
            const servicesWithHeaders = Object.values(REGISTRY).filter((service) => service.headers);
            return servicesWithHeaders.filter((service) => service.headers?.key === d.type && (service.headers?.value === '*' || service.headers?.value === d.value))
        })
        .map((service) => ({
            label: "SERVICE",
            metadata: {
                value: service.identifier,
                genre: service.genre,
                via: "headers",
            },
        }));
};

const exports = { parse };
export default exports;
