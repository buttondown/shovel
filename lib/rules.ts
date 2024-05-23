import { DNSRecord } from "./dns";

type Rule = (record: DNSRecord) => string | null;

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
};

const NAMESERVER_RULE = (record: DNSRecord): string | null => {
  if (record.type !== "NS") {
    return null;
  }
  return (
    Object.entries(NAMESERVER_VALUE_TO_PROVIDER)
      .map(([value, provider]) => {
        if (record.value.includes(value)) {
          return `This domain uses ${provider} for DNS.`;
        }
      })
      .filter(Boolean)
      .join("") || null
  );
};

const MX_RULE = (record: DNSRecord): string | null => {
  if (record.type !== "MX") {
    return null;
  }
  return (
    Object.entries(MX_VALUE_TO_PROVIDER)
      .map(([value, provider]) => {
        if (record.value.includes(value)) {
          return `This domain uses ${provider} for email.`;
        }
      })
      .filter(Boolean)
      .join("") || null
  );
};

const CNAME_RULE = (record: DNSRecord): string | null => {
  if (record.type !== "CNAME") {
    return null;
  }
  return (
    Object.entries(CNAME_VALUE_TO_PROVIDER)
      .map(([value, provider]) => {
        if (record.value.includes(value)) {
          return `This domain uses ${provider}.`;
        }
      })
      .filter(Boolean)
      .join("") || null
  );
};

const SPF_RULE = (record: DNSRecord): string | null => {
  if (record.type !== "TXT") {
    return null;
  }
  if (record.value.includes("v=spf1") !== -1) {
    return "This domain has an SPF record.";
  }
  return null;
};

const RULES: Rule[] = [NAMESERVER_RULE, MX_RULE, SPF_RULE, CNAME_RULE];

const filterToUnique = (values: string[]): string[] => {
  return Array.from(new Set(values));
};

const run = (records: DNSRecord[]): string[] => {
  return filterToUnique(
    records
      .map((record) => RULES.map((rule) => rule(record)).filter(Boolean))
      .flat() as string[]
  );
};

export default { run };
