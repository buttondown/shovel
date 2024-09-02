import dns from "@/lib/loaders/dns";
import dns_prefix from "@/lib/loaders/dns_prefix";
import html from "@/lib/loaders/html";
import tranco from "@/lib/loaders/tranco";
import records from "@/lib/parsers/dns";
import headers from "@/lib/parsers/headers";
import htmlRecords from "@/lib/parsers/html";
import { unique } from "@/lib/utils";
import pino from "pino";
import { Loader } from "./loaders/types";

const LOADERS = [dns, html, dns_prefix, tranco];
const PARSERS = [records, htmlRecords, headers];

const logger = pino();

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

const fetch = async (domain: string) => {
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

    const notes = PARSERS.flatMap((parser) => parser.parse(data));
    return {
        domain,
        data: unique(data),
        notes: [
            ...unique(notes, (n) => n.metadata.value),
            ...data
                .filter((d) => d.label === "SERVICE")
                .flatMap((d) => d.data)
                .map((d) => {
                    return {
                        label: "SERVICE",
                        metadata: {
                            value: d.type,
                            username: "",
                        },
                    };
                }),
        ],
    };
};

export default fetch;
