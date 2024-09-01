import atproto from "@/lib/loaders/atproto";
import bimi from "@/lib/loaders/bimi";
import dmarc from "@/lib/loaders/dmarc";
import dns from "@/lib/loaders/dns";
import html from "@/lib/loaders/html";
import tranco from "@/lib/loaders/tranco";
import records from "@/lib/parsers/dns";
import fly from "@/lib/parsers/fly";
import heroku from "@/lib/parsers/heroku";
import htmlRecords from "@/lib/parsers/html";
import netlify from "@/lib/parsers/netlify";
import php from "@/lib/parsers/php";
import webflow from "@/lib/parsers/webflow";
import { unique } from "@/lib/utils";
import pino from "pino";
import { Loader } from "./loaders/types";

const LOADERS = [dns, html, dmarc, bimi, atproto, tranco];
const PARSERS = [records, htmlRecords, netlify, webflow, php, fly, heroku];

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
        notes: unique(notes, (n) => n.metadata.value),
    };
};

export default fetch;
