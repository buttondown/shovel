import { REGISTRY } from "../lib/affiliations/registry";
import type { Affiliation } from "../lib/affiliations/types";
import { db } from "../lib/db/connection";

async function refreshAffiliation(identifier: string) {
	const affiliation = REGISTRY[identifier];

	if (!affiliation) {
		console.error(`Affiliation "${identifier}" not found in the registry.`);
		process.exit(1);
	}

	if (!affiliation.load) {
		console.error(
			`Affiliation "${identifier}" does not have a loader function.`,
		);
		process.exit(1);
	}

	try {
		console.log(`Refreshing affiliation: ${identifier}`);
		const generator = affiliation.load();
		let batch: Affiliation[] = [];

		for await (const result of generator) {
			batch.push(result);

			if (batch.length === 10) {
				await db
					.insertInto("affiliations")
					.values(
						batch.map((item) => ({
							domain: item.domain,
							identifier,
							metadata: JSON.stringify(item.metadata),
							creation_date: new Date().toISOString(),
						})),
					)
					.execute();
				batch = [];
			}
		}

		// Insert any remaining items
		if (batch.length > 0) {
			await db
				.insertInto("affiliations")
				.values(
					batch.map((item) => ({
						domain: item.domain,
						identifier,
						metadata: JSON.stringify(item.metadata),
						creation_date: new Date().toISOString(),
					})),
				)
				.execute();
		}
	} catch (error) {
		console.error(`Error refreshing affiliation ${identifier}:`, error);
		process.exit(1);
	}
}

// Check if an affiliation name was provided as a command-line argument
const affiliationArg = process.argv[2];

if (!affiliationArg) {
	console.error("Please provide an affiliation name as an argument.");
	process.exit(1);
}

refreshAffiliation(affiliationArg);
