import fetch from "@/lib/data";
import { reify } from "@/lib/db/domains";

const SOCIAL_MEDIA_SERVICES = [
	"facebook",
	"twitter",
	"instagram",
	"linkedin",
	"youtube",
	"github",
];

export async function GET(
	request: Request,
	context: {
		params: {
			domain: string;
		};
	},
) {
	const rawResponse = await fetch(context.params.domain);
	await reify(context.params.domain, rawResponse);

	return Response.json({
		domain: context.params.domain,
		records: rawResponse.data
			.filter((datum) => datum.label === "DNS")
			.flatMap((datum) => datum.data),
		ranking: rawResponse.data.find((datum) => datum.label === "Tranco")?.data[0]
			?.value,
		services: rawResponse.detected_technologies
			.filter((technology) => technology.identifier !== "subdomain")
			.map((technology) => technology.identifier)
			.sort(),
		subdomains: rawResponse.detected_technologies
			.filter((technology) => technology.identifier === "subdomain")
			.map((technology) => technology.metadata.value)
			.sort(),
		social_media: Object.fromEntries(
			SOCIAL_MEDIA_SERVICES.map((service) => [
				service,
				rawResponse.detected_technologies.find(
					(note) => note.identifier === service,
				)?.metadata.username,
			]),
		),
	});
}
