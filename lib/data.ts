import dns from "@/lib/loaders/dns";
import dns_prefix from "@/lib/loaders/dns_prefix";
import html from "@/lib/loaders/html";
import tranco from "@/lib/loaders/tranco";
import records from "@/lib/parsers/dns";
import headers from "@/lib/parsers/headers";
import htmlRecords from "@/lib/parsers/html";
import { unique } from "@/lib/utils";
import pino from "pino";
import { Loader, RecordGroup } from "./loaders/types";
import { DetectedTechnology } from "./parsers/types";

const LOADERS = [dns, html, dns_prefix, tranco];
const PARSERS = [records, htmlRecords, headers];

const logger = pino({
    level: process.env.PINO_LEVEL || "warn",
});

const load = async (
    domain: string,
    loader: {
        load: Loader;
        name: string;
    }
) => {
    logger.info({ message: "loader.started", domain, loader: loader.name });
    const data = await loader.load(domain);
    logger.info({ message: "loader.ended", domain, loader: loader.name });
    return data;
};

const fetch = async (domain: string): Promise<{
    domain: string;
    data: RecordGroup[];
    detected_technologies: DetectedTechnology[];
}> => {
    const data = [
        ...(await Promise.all(LOADERS.map((loader) => load(domain, loader)))),
        {
            label: "URL",
            data: [
                {
                    value: `${domain}`,
                    type: "text/url",
                },
            ],
        },
    ];

    const detected_technologies = PARSERS.flatMap((parser) => parser.parse(data));
    return {
        domain,
        data: unique(data),
        detected_technologies: [
            ...unique(detected_technologies, (n) => n.identifier === "subdomain" ? n.metadata.value : n.identifier),
            ...data
                .filter((d) => d.label === "SERVICE")
                .flatMap((d) => d.data)
                .map((d) => {
                    return {
                        identifier: d.type,
                        metadata: {},
                    };
                }),
        ],
    };
};

export default fetch;
