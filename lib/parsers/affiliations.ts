import { db } from "@/lib/db/connection";
import type { RecordGroup } from "../loaders/types";
import type { Parser } from "./types";

const parse: Parser = async (domain: string, data: RecordGroup[]) => {
	if (process.env.DISABLE_DATABASE === "true") {
		return [];
	}

	const affiliations = await db
		.selectFrom("affiliations")
		.where("domain", "=", domain)
		.selectAll()
		.execute();

	return affiliations.map((affiliation) => ({
		identifier: affiliation.identifier,
		metadata: affiliation.metadata,
	}));
};

const exports = { parse };
export default exports;
