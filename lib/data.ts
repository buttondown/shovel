import dns from "@/lib/loaders/dns";
import html from "@/lib/loaders/html";
import records from "@/lib/parsers/dns";
import htmlRecords from "@/lib/parsers/html";

const LOADERS = [dns, html];
const PARSERS = [records, htmlRecords];

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