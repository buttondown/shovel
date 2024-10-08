import type { Record } from "../loaders/types";
import { REGISTRY } from "../services";
import type { DetectedTechnology, Parser } from "./types";

const NAMESERVER_RULE = (record: Record): DetectedTechnology[] => {
	if (record.type !== "NS") {
		return [];
	}
	return Object.values(REGISTRY).flatMap((service) => {
		if (service.ns_values === undefined) {
			return [];
		}
		if (record.value.includes(service.ns_values[0])) {
			return [
				{
					identifier: service.identifier,
					metadata: {
						genre: "nameserver",
					},
				},
			];
		}
		return [];
	});
};

const TXT_RULE = (record: Record): DetectedTechnology[] => {
	if (record.type !== "TXT") {
		return [];
	}
	return Object.values(REGISTRY).flatMap((service) => {
		if (service.txt_values === undefined) {
			return [];
		}
		if (service.txt_values.some((value) => record.value.includes(value))) {
			return [
				{
					identifier: service.identifier,
					metadata: {
						via: "TXT",
					},
				},
			];
		}
		return [];
	});
};

const MX_RULE = (record: Record): DetectedTechnology[] => {
	if (record.type !== "MX") {
		return [];
	}
	return Object.values(REGISTRY).flatMap((service) => {
		if (
			(service.mx_values || []).some((value) => record.value.includes(value))
		) {
			return [
				{
					identifier: service.identifier,
					metadata: {
						genre: "Mailserver",
					},
				},
			];
		}
		return [];
	});
};

const CNAME_RULE = (record: Record): DetectedTechnology[] => {
	if (record.type !== "CNAME") {
		return [];
	}
	return Object.values(REGISTRY).flatMap((service) => {
		if (
			(service.cname_values || []).some((value) => record.value.includes(value))
		) {
			return [
				{
					identifier: service.identifier,
					metadata: {
						via: "CNAME",
					},
				},
			];
		}
		return [];
	});
};

const extractURLsOrIPsFromSPF = (record: string): string[] => {
	return record
		.split(" ")
		.filter((part) => part.includes("include:") || part.includes("ip4:"))
		.map((part) => part.split(":")[1])
		.map(
			(part) =>
				Object.values(REGISTRY).find((s) =>
					s.spf_values?.some((v) =>
						v.includes("*") ? part.includes(v.replace("*", "")) : v === part,
					),
				)?.identifier || part,
		);
};

const isIPAddress = (value: string): boolean => {
	// Catch both 127.0.0.1 _and_ 127.0.0.1/17.
	return (
		value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?:\/[0-9]{1,2})?$/) !== null
	);
};

const SPF_RULE = (record: Record): DetectedTechnology[] => {
	if (record.type !== "TXT") {
		return [];
	}
	if (record.value.startsWith("v=spf1")) {
		return extractURLsOrIPsFromSPF(record.value).flatMap((value) => {
			if (isIPAddress(value)) {
				return [];
			}
			return [
				{
					identifier: value,
					metadata: {
						via: "SPF",
					},
				},
			];
		});
	}
	return [];
};

const RULES = [NAMESERVER_RULE, MX_RULE, SPF_RULE, CNAME_RULE, TXT_RULE];

const filterToUnique = (values: DetectedTechnology[]): DetectedTechnology[] => {
	const seen = new Set<string>();
	return values.filter((value) => {
		const key = JSON.stringify(value);
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
};

const parse: Parser = (domain, data) => {
	return Promise.resolve(
		filterToUnique(
			data
				.filter((datum) => datum.label === "DNS")
				.flatMap((datum) => RULES.flatMap((rule) => datum.data.flatMap(rule))),
		),
	);
};
const exports = { parse };
export default exports;
