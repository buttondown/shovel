import type { Affiliation } from "../types";

const TRANCO_URL = "https://tranco-list.eu/download/KJ94W/1000000";

export default async function* load(): AsyncGenerator<Affiliation> {
	const response = await fetch(TRANCO_URL);
	const data = await response.text();
	const lines = data
		.split("\n")
		.filter((line) => line.trim() !== "")
		.map((line) => line.split(","));

	for (const [rank, domain] of lines) {
		yield {
			domain,
			metadata: {
				rank: rank,
			},
		};
	}
}
