import atproto from "@/lib/loaders/atproto";
import bimi from "@/lib/loaders/bimi";
import dmarc from "@/lib/loaders/dmarc";
import dns from "@/lib/loaders/dns";
import html from "@/lib/loaders/html";
import records from "@/lib/parsers/dns";
import fly from "@/lib/parsers/fly";
import heroku from "@/lib/parsers/heroku";
import htmlRecords from "@/lib/parsers/html";
import netlify from "@/lib/parsers/netlify";
import php from "@/lib/parsers/php";
import webflow from "@/lib/parsers/webflow";

const LOADERS = [dns, html, dmarc, bimi, atproto];
const PARSERS = [records, htmlRecords, netlify, webflow, php, fly, heroku];

const fetch = async (domain: string) => {
  const data = [
    ...(await Promise.all(LOADERS.map((loader) => loader.load(domain)))),
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
    data,
    notes,
  };
};

export default fetch;
