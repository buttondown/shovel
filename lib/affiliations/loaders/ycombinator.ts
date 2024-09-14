import { XMLParser } from "fast-xml-parser";
import { extractDomain } from "../../utils";
import type { Affiliation } from "../types";

const SITEMAP_URL = "https://www.ycombinator.com/companies/sitemap.xml";

export default async function* load(): AsyncGenerator<Affiliation> {
	const response = await fetch(SITEMAP_URL);
	const data = await response.text();
	const parser = new XMLParser();
	const result = parser.parse(data);
	const relevantURLs = result.urlset.url.filter(
		(url: { loc: string }) => !url.loc.includes("/industry/"),
	);

	for (const url of relevantURLs) {
		try {
			const companyResponse = await fetch(url.loc);
			const companyHtml = await companyResponse.text();
			const hrefMatch = companyHtml.match(
				/href="([^"]*)"[^>]*class="[^"]*mb-2[^"]*whitespace-nowrap[^"]*"/,
			);

			if (hrefMatch?.[1]) {
				if (hrefMatch[1] === "https://") {
					continue;
				}

				yield {
					domain: extractDomain(hrefMatch[1]),
					metadata: {
						originalUrl: url.loc,
					},
				};
			}
		} catch (error) {
			console.error(`Error fetching ${url.loc}:`, error);
		}
	}
}
