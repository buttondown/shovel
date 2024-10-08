import fetch from "@/lib/data";
import { db } from "@/lib/db/connection";
import { reify } from "@/lib/db/domains";
import { sql } from "kysely";
import pino from "pino";

const logger = pino({
    name: "cron-refresh",
});

// Without this comment, Next.js will cache the response
// and therefore this endpoint does not do anything. (I really wish
// we had a simpler way to trigger and manage these; might be worth looking
// into Trigger at some point.)
export const revalidate = 0;

// This `sample` is a cute trick to get a random sample of domains without
// having to do a full table scan.
const RAW_QUERY = sql<{
    domain: string;
}>`
    select domain from tranco TABLESAMPLE system (0.02)
`;

const getRandomDomains = async () => {
	const domains = await RAW_QUERY.execute(db);
    return domains.rows.map((row) => row.domain);
};

const MAXIMUM_DOMAINS = 10;

export async function GET(
	request: Request,
	context: {
		params: {
			domain: string;
		};
	},
) {
    const domains = await getRandomDomains();
    const selectedDomains = domains.slice(0, MAXIMUM_DOMAINS);
    await Promise.all(selectedDomains.map(async (domain) => {
        logger.info({
            message: "refresh.started",
            domain: domain,
        });
        const rawResponse = await fetch(domain);
		await reify(domain, rawResponse);
	}));

	return Response.json({
        domains: selectedDomains,
    });
}
