import fetch from "@/lib/data";
import { reify } from "@/lib/db/domains";
import { REGISTRY } from "@/lib/services";

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
    }
) {
    const rawResponse = await fetch(context.params.domain);
    await reify(context.params.domain, rawResponse);

    return Response.json({
        domain: context.params.domain,
        ranking: rawResponse.data.find((datum) => datum.label === "Tranco")?.data[0]?.value,
        services: rawResponse.notes.filter((note) => note.label === "SERVICE").map((note) => note.metadata.value).filter((service) => service in REGISTRY).sort(),
        subdomains: rawResponse.notes.filter((note) => note.label === "SUBDOMAIN").map((note) => note.metadata.value).sort(),
        social_media: Object.fromEntries(SOCIAL_MEDIA_SERVICES.map(service => [service, rawResponse.notes.find((note) => note.label === "SERVICE" && note.metadata.value === service)?.metadata.username]))
    });
}
