import { Record } from "../loaders/types";
import { Note, Parser } from "./types";

const NAMESERVER_VALUE_TO_PROVIDER = {
  "ns.cloudflare.com": "Cloudflare",
  "dnsimple.com": "DNSimple",
  "dreamhost.com": "DreamHost",
  "vercel-dns.com": "Vercel",
};

const CNAME_VALUE_TO_PROVIDER = {
  "target.substack-custom-domains.com": "Substack",
  "cname.vercel-dns.com": "Vercel",
};

const MX_VALUE_TO_PROVIDER = {
  "aspmx.l.google.com": "Google",
  "smtp.messagingengine.com": "FastMail",
  "mx1.privateemail.com": "Namecheap",
  "mx1.emailsrvr.com": "Rackspace",
  "work-mx.app.hey.com": "Hey",
  "mx2.zoho.com": "Zoho",
  "mx.zoho.eu": "Zoho",
};

const NAMESERVER_RULE = (record: Record): Note[] => {
  if (record.type !== "NS") {
    return [];
  }
  return Object.entries(NAMESERVER_VALUE_TO_PROVIDER).flatMap(
    ([value, provider]) => {
      if (record.value.includes(value)) {
        return [
          {
            label: "NAMESERVER",
            metadata: {
              value: provider,
            },
          },
        ];
      }
      return [];
    }
  );
};

const MX_RULE = (record: Record): Note[] => {
  if (record.type !== "MX") {
    return [];
  }
  return Object.entries(MX_VALUE_TO_PROVIDER).flatMap(([value, provider]) => {
    if (record.value.includes(value)) {
      return [
        {
          label: "MAILSERVER",
          metadata: {
            value: provider,
          },
        },
      ];
    }
    return [];
  });
};

const CNAME_RULE = (record: Record): Note[] => {
  if (record.type !== "CNAME") {
    return [];
  }
  return Object.entries(CNAME_VALUE_TO_PROVIDER).flatMap(
    ([value, provider]) => {
      if (record.value.includes(value)) {
        return [
          {
            label: "CNAME",
            metadata: {
              value: provider,
            },
          },
        ];
      }
      return [];
    }
  );
};

const SPF_RULE = (record: Record): Note[] => {
  if (record.type !== "TXT") {
    return [];
  }
  if (record.value.includes("v=spf1")) {
    return [
      {
        label: "SPF",
        metadata: {},
      },
    ];
  }
  return [];
};

const RULES = [NAMESERVER_RULE, MX_RULE, SPF_RULE, CNAME_RULE];

const filterToUnique = (values: Note[]): Note[] => {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const parse: Parser = (data) => {
  return filterToUnique(
    data
      .filter((datum) => datum.label === "DNS")
      .flatMap((datum) => RULES.flatMap((rule) => datum.data.flatMap(rule)))
  );
};
const exports = { parse };
export default exports;
