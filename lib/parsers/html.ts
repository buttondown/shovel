import { parse as parseHTML } from "node-html-parser";
import { REGISTRY } from "../services";
import type { DetectedTechnology, Parser } from "./types";

const GENERIC_SOCIAL_MEDIA_PROVIDER = (html: string) => {
	const socialMediaProviders = Object.values(REGISTRY).filter(
		(service) => service.genre === "social_media",
	);
	const potentialMatches = socialMediaProviders.filter((provider) =>
		provider.urlSubstrings?.some((substring) => html.includes(substring)),
	);
	return potentialMatches
		.flatMap((service) =>
			service.urlSubstrings?.map((s) => {
				return {
					identifier: service.identifier,
					substring: s,
				};
			}),
		)
		.flatMap((potentialMatch) => {
			const match = html.match(
				new RegExp(
					`href=["']https?://(www\.)?${potentialMatch?.substring}/([^/"^%]+?)/?["']`,
				),
			);
			if (match) {
				const username = match[match.length - 1];
				return [
					{
						identifier: potentialMatch?.identifier as string,
						metadata: {
							username: username.split("?")[0],
						},
					},
				];
			}
			return [];
		});
};

const TWITTER_RULE = (html: string) => {
	// Match on `<a href="https://twitter.com/username"> and pull out the username.
	// Make sure to avoid matching on twitter.com/intent.
	const match = html.match(/href="https:\/\/twitter.com\/([^\/"]+)"/);
	if (match) {
		const username = match[1];
		// Also remove query parameters from the username.
		const usernameWithoutQuery = username.split("?")[0];
		return [
			{
				identifier: "twitter",
				metadata: { username: usernameWithoutQuery },
			},
		];
	}

	// Also check for `rel="me"` links that have twitter in them, like:
	// <link rel="me" href="https://twitter.com/username" />
	const match2 = html.match(
		/<link rel="me" href="https:\/\/twitter.com\/([^\/"]+)"/,
	);
	if (match2) {
		const username = match2[1];
		// Also remove query parameters from the username.
		const usernameWithoutQuery = username.split("?")[0];
		return [
			{
				identifier: "twitter",
				metadata: { username: usernameWithoutQuery },
			},
		];
	}
	return [];
};

const EMAIL_ADDRESS_RULE = (html: string) => {
	// Match on `<a href="https://twitter.com/username"> and pull out the username.
	const match = html.match(/<a href="mailto:(.+?)"/);
	if (match) {
		const username = match[1];
		return [
			{
				identifier: "email",
				metadata: { username },
			},
		];
	}
	return [];
};

const JSONLD_RULE = (html: string) => {
	const tag = parseHTML(html).querySelector(
		"script[type='application/ld+json']",
	);
	if (!tag) {
		return [];
	}
	const text = tag.text;
	const baseRule = [
		{
			identifier: "jsonld",
			metadata: { value: text },
		},
	];

	try {
		const parsedJson = JSON.parse(text);
		const graph = Array.isArray(parsedJson) ? parsedJson : parsedJson["@graph"];

		if (Array.isArray(graph)) {
			const additionalRules = graph
				.filter((item) => item && Array.isArray(item.sameAs))
				.flatMap((item) =>
					item.sameAs
						.map((url: string) => {
							const service = Object.values(REGISTRY).find((s) =>
								url.includes(s.urlSubstrings?.[0] || ""),
							);
							if (service) {
								return {
									identifier: service.identifier.split("?")[0] as string,
									metadata: {
										username: url.split("/").pop() || "",
									},
								};
							}
							return null;
						})
						.filter(Boolean),
				);

			baseRule.push(...additionalRules);
		}
	} catch (error) {
		console.error("Error parsing or processing JSON-LD:", error);
	}
	return baseRule;
};

const RSS_RULE = (html: string): DetectedTechnology[] => {
	const tag = parseHTML(html).querySelector("link[type='application/rss+xml']");
	if (tag) {
		const href = tag.getAttribute("href") || "";
		return [
			{
				identifier: "rss",
				metadata: { url: href },
			},
		];
	}

	const tag2 = parseHTML(html).querySelector("a[href*='feed.xml']");
	if (tag2) {
		const href = tag2.getAttribute("href") || "";
		return [
			{
				identifier: "rss",
				metadata: { url: href },
			},
		];
	}

	return [];
};

const isValidSubdomain = (potentialValue: string, domain: string) => {
	if (!potentialValue.startsWith("http")) {
		return false;
	}
	try {
		const url = new URL(potentialValue);
		return url.hostname.includes(domain) && url.hostname !== `www.${domain}`;
	} catch (error) {
		return false;
	}
};

const SUBDOMAIN_RULE = (html: string, domain: string) => {
	const subdomains = parseHTML(html)
		.querySelectorAll("a")
		.map((a) => ({
			value: a.getAttribute("href"),
		}))
		.filter((v) => isValidSubdomain(v.value || "", domain))
		.map((v) => ({
			value: new URL(v.value || "").hostname,
		}))
		.filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i)
		.filter((v) => v.value !== domain);
	return subdomains.map((subdomain) => ({
		// Subdomains aren't a technology, but it's kind of a weird case. We do need
		// a better abstraction here, though.
		identifier: "subdomain",
		metadata: {
			value: subdomain.value,
		},
	}));
};

const RULES: ((html: string, domain: string) => DetectedTechnology[])[] = [
	...Object.values(REGISTRY).map((service) => {
		return (html: string) => {
			const potentialMatches = service.substrings?.filter((substring) =>
				html.includes(substring),
			);
			return (
				potentialMatches?.map(() => {
					return {
						identifier: service.identifier,
						metadata: {
							value: service.identifier,
							via: "URL",
						},
					};
				}) || []
			);
		};
	}),
	TWITTER_RULE,
	GENERIC_SOCIAL_MEDIA_PROVIDER,
	EMAIL_ADDRESS_RULE,
	RSS_RULE,
	JSONLD_RULE,
	SUBDOMAIN_RULE,
];

const parse: Parser = (domain, data) => {
	const html = data.find((datum) => datum.label === "HTML")?.data[0].value;
	if (!domain || !html) {
		return Promise.resolve([]);
	}
	return Promise.resolve(RULES.flatMap((rule) => rule(html, domain)));
};
const exports = { parse };
export default exports;
