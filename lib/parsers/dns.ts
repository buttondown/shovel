import { Record } from "../loaders/types";
import { Note, Parser } from "./types";

const TXT_VALUE_TO_PROVIDER = {
  "paddle-verification": "Paddle",
  "google-site-verification": "Google Webmaster Tools",
  "ahrefs-site-verification": "Ahrefs",
  "h1-domain-verification": "HackerOne",
  "facebook-domain-verification": "Facebook",
  "loom-verification": "Loom",
  "mixpanel-domain-verify": "Mixpanel",
  "whimsical=": "Whimsical",
  "stripe-verification=": "Stripe",
  "klaviyo-site-verification": "Klaviyo",
  "mail.zendesk.com": "Zendesk",
};

const NAMESERVER_VALUE_TO_PROVIDER = {
  "ns.cloudflare.com": "Cloudflare",
  "dnsimple.com": "DNSimple",
  "dreamhost.com": "DreamHost",
  "vercel-dns.com": "Vercel",
  "wixdns.net": "Wix",
};

const CNAME_VALUE_TO_PROVIDER = {
  "target.substack-custom-domains.com": "Substack",
  "cname.vercel-dns.com": "Vercel",
  "pr-suspensions.go.co": "Suspended",
  "pages.github.com": "GitHub",
  "gitbook.io": "GitBook",
  "boards.consider.com": "Consider",
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

const TXT_RULE = (record: Record): Note[] => {
  if (record.type !== "TXT") {
    return [];
  }
  return Object.entries(TXT_VALUE_TO_PROVIDER).flatMap(([value, provider]) => {
    if (record.value.includes(value)) {
      return [
        {
          label: "SERVICE",
          metadata: {
            value: provider,
            via: "TXT",
          },
        },
      ];
    }
    return [];
  });
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
            label: "SERVICE",
            metadata: {
              value: provider,
              via: "CNAME",
            },
          },
        ];
      }
      return [];
    }
  );
};

const SPF_URL_TO_PROVIDER: {
  [key: string]: string;
} = {
  "_spf.google.com": "Google",
  "_spf.createsend.com": "Campaign Monitor",
  "mailgun.org": "Mailgun",
  "servers.mcsv.net": "Mailchimp",
  "_spf.salesforce.com": "Salesforce",
  "spf.happyfox.com": "HappyFox",
  "spf.smtp2go.com": "SMTP2GO",
  "mktomail.com": "Marketo",
  "aspmx.pardot.com": "Pardot",
  "spfhost.messageprovider.com": "Markmonitor",
  "spf.protection.outlook.com": "Outlook",
};

const extractURLsOrIPsFromSPF = (record: string): string[] => {
  return record
    .split(" ")
    .filter((part) => part.includes("include:") || part.includes("ip4:"))
    .map((part) => part.split(":")[1])
    .map((part) => SPF_URL_TO_PROVIDER[part] || part);
};

const isIPAddress = (value: string): boolean => {
  return value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) !== null;
};

const SPF_RULE = (record: Record): Note[] => {
  if (record.type !== "TXT") {
    return [];
  }
  if (record.value.startsWith("v=spf1")) {
    return extractURLsOrIPsFromSPF(record.value).flatMap((value) => {
      if (isIPAddress(value)) {
        return [];
      }
      return [
        {
          label: "SERVICE",
          metadata: {
            value,
            via: "SPF",
          },
        },
      ];
    });
  }
  return [];
};

const RULES = [NAMESERVER_RULE, MX_RULE, SPF_RULE, CNAME_RULE, TXT_RULE];

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
