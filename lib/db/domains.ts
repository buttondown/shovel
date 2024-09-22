import type fetch from "@/lib/data";
import { db } from "@/lib/db/connection";

export const reify = async (
	domain: string,
	data: Awaited<ReturnType<typeof fetch>>,
) => {
	await db
		.insertInto("domains")
		.values({
			domain: domain,
			data: JSON.stringify(data),
		})
		.execute();

	const existingTechnologies = await db
		.selectFrom("detected_technologies")
		.select("technology")
		.where("domain", "=", domain)
		.execute();

	const existingTechSet = new Set(
		existingTechnologies.map((tech) => tech.technology),
	);

	const newTechnologies = data.detected_technologies
		.filter((technology) => !existingTechSet.has(technology.identifier))
		.map((technology) => ({
			domain: domain,
			technology: technology.identifier,
			data: JSON.stringify(technology.metadata),
			creation_date: new Date().toISOString(),
		}));

	if (newTechnologies.length > 0) {
		await db
			.insertInto("detected_technologies")
			.values(newTechnologies)
			.execute();
	}
};
