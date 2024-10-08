import type { RecordGroup } from "../loaders/types";
import { REGISTRY } from "../services";
import type { Parser } from "./types";

const parse: Parser = (domain: string, data: RecordGroup[]) => {
	return Promise.resolve(
		data
			.flatMap((datum) => datum.data)
			.flatMap((d) => {
				const servicesWithHeaders = Object.values(REGISTRY).filter(
					(service) => service.headers,
				);
				return servicesWithHeaders.filter(
					(service) =>
						d.type.includes(service.headers?.key || "") &&
						(service.headers?.value === "*" ||
							d.value.includes(service.headers?.value || "")),
				);
			})
			.map((service) => ({
				identifier: service.identifier,
				metadata: {
					via: "headers",
				},
			})),
	);
};

const exports = { parse };
export default exports;
