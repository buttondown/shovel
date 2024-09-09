import { XMLParser } from "fast-xml-parser";
import { Affiliation } from "../types";

const SITEMAP_URL = "https://www.ycombinator.com/companies/sitemap.xml";

export default async function load(): Promise<Affiliation[]> {
        const response = await fetch(SITEMAP_URL);
        const data = await response.text();
        const parser = new XMLParser();
        const result = parser.parse(data);
        const relevantURLs = result.urlset.url.filter((url: { loc: string }) => url.loc.endsWith(".com") && !url.loc.includes("/industry/"));
        const affiliations: Affiliation[] = [];
        for (const url of relevantURLs) {
            try {
                const companyResponse = await fetch(url.loc);
                const companyHtml = await companyResponse.text();
                const hrefMatch = companyHtml.match(/href="([^"]*)"[^>]*class="[^"]*mb-2[^"]*whitespace-nowrap[^"]*"/);

                if (hrefMatch && hrefMatch[1]) {
                    affiliations.push({
                        identifier: hrefMatch[1],
                        metadata: {
                            source: 'ycombinator',
                            originalUrl: url.loc
                        }
                    });
                }
            } catch (error) {
                console.error(`Error fetching ${url.loc}:`, error);
            }
        }

    return affiliations;
}
