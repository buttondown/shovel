import { extractDomain } from "../../utils";
import type { Affiliation } from "../types";

const OSSPLEDGE_URL =
	"https://raw.githubusercontent.com/opensourcepledge/osspledge.com/main/members.csv";

export default async function* load(): AsyncGenerator<Affiliation> {
	const response = await fetch(OSSPLEDGE_URL);
	const data = await response.text();
	const lines = data
		.split("\n")
		.map((line) => line.split(",")[1])
		.filter((l) => l !== undefined);

	for (const url of lines) {
		yield {
			domain: extractDomain(url),
			metadata: {
				url: url,
			},
		};
	}
}
