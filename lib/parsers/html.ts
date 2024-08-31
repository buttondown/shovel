import { parse as parseHTML } from "node-html-parser";
import { REGISTRY } from "../services";
import { Note, Parser } from "./types";

const GENERIC_SOCIAL_MEDIA_PROVIDER = (html: string) => {
  const socialMediaProviders = Object.values(REGISTRY).filter(
    (service) => service.genre === "social_media"
  );
  const potentialMatches = socialMediaProviders.filter((provider) =>
    provider.urlSubstrings?.some((substring) => html.includes(substring))
  );
  return potentialMatches
    .flatMap((service) =>
      service.urlSubstrings?.map((s) => {
        return {
          identifier: service.identifier,
          substring: s,
        };
      })
    )
    .flatMap((potentialMatch) => {
      const match = html.match(
        new RegExp(
          `href=["']https?://(www\.)?${potentialMatch?.substring}/([^/"^%]+?)/?["']`
        )
      );
      if (match) {
        const username = match[match.length - 1];
        return [
          {
            label: "SOCIAL_MEDIA",
            metadata: {
              username,
              service: potentialMatch?.identifier,
            },
          },
        ];
      }
      return [];
    });
};

const TWITTER_RULE = (html: string) => {
  // Match on `<a href="https://twitter.com/username"> and pull out the username.
  // Make sure to avoid matching on twitter.com/intent.
  const match = html.match(/href="https:\/\/twitter.com\/([^\/"]+)"/);
  if (match) {
    const username = match[1];
    // Also remove query parameters from the username.
    const usernameWithoutQuery = username.split("?")[0];
    return [
      {
        label: "SOCIAL_MEDIA",
        metadata: { username: usernameWithoutQuery, service: "twitter" },
      },
    ];
  }

  // Also check for `rel="me"` links that have twitter in them, like:
  // <link rel="me" href="https://twitter.com/username" />
  const match2 = html.match(
    /<link rel="me" href="https:\/\/twitter.com\/([^\/"]+)"/
  );
  if (match2) {
    const username = match2[1];
    // Also remove query parameters from the username.
    const usernameWithoutQuery = username.split("?")[0];
    return [
      {
        label: "SOCIAL_MEDIA",
        metadata: { username: usernameWithoutQuery, service: "witter" },
      },
    ];
  }
  return [];
};

const EMAIL_ADDRESS_RULE = (html: string) => {
  // Match on `<a href="https://twitter.com/username"> and pull out the username.
  const match = html.match(/<a href="mailto:(.+?)"/);
  if (match) {
    const username = match[1];
    return [
      {
        label: "Email",
        metadata: { username },
      },
    ];
  }
  return [];
};

const JSONLD_RULE = (html: string) => {
  const tag = parseHTML(html).querySelector(
    "script[type='application/ld+json']"
  );
  if (tag) {
    const text = tag.text;
    const baseRule = [
      {
        label: "JSON+LD",
        metadata: { value: text },
      },
      ...(JSON.parse(text)
        ["@graph"]?.filter((i: { sameAs: string[] }) => i.sameAs)
        .flatMap((i: any) => {
          return i.sameAs.flatMap((url: string) => {
            const service = Object.values(REGISTRY).find((service) =>
              url.includes(service.urlSubstrings?.[0] || "")
            );
            if (!service) {
              return [];
            }
            return [
              {
                label: "SOCIAL_MEDIA",
                metadata: {
                  service: service.identifier,
                  username: url.split("/").pop(),
                },
              },
            ];
          });
        }) || []),
    ];
    return baseRule;
  }
  return [];
};

const RSS_RULE = (html: string): Note[] => {
  const tag = parseHTML(html).querySelector("link[type='application/rss+xml']");
  if (tag) {
    const href = tag.getAttribute("href") || "";
    return [
      {
        label: "RSS",
        metadata: { url: href },
      },
    ];
  }

  const tag2 = parseHTML(html).querySelector("a[href*='feed.xml']");
  if (tag2) {
    const href = tag2.getAttribute("href") || "";
    return [
      {
        label: "RSS",
        metadata: { url: href },
      },
    ];
  }

  return [];
};

const SUBDOMAIN_RULE = (html: string, domain: string) => {
  const subdomains = parseHTML(html)
    .querySelectorAll("a")
    .map((a) => ({
      value: a.getAttribute("href"),
    }))
    .filter(
      (v) =>
        v.value && v.value.startsWith("http") && v.value.includes(`.${domain}`)
    )
    .map((v) => ({
      value: new URL(v.value || "").hostname,
    }))
    .filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
  return subdomains.map((subdomain) => ({
    label: "SUBDOMAIN",
    metadata: {
      value: subdomain.value,
    },
  }));
};

const RULES: ((html: string, domain: string) => Note[])[] = [
  ...Object.values(REGISTRY).map((service) => {
    return (html: string, domain: string) => {
      const potentialMatches = service.substrings?.filter((substring) =>
        html.includes(substring)
      );
      return (
        potentialMatches?.map(() => {
          return {
            label: "SERVICE",
            metadata: {
              value: service.identifier,
              via: "URL",
            },
          };
        }) || []
      );
    };
  }),
  TWITTER_RULE,
  GENERIC_SOCIAL_MEDIA_PROVIDER,
  EMAIL_ADDRESS_RULE,
  RSS_RULE,
  JSONLD_RULE,
  SUBDOMAIN_RULE,
];

const parse: Parser = (data) => {
  const domain = data.find((datum) => datum.label === "URL")?.data[0].value;
  const html = data.find((datum) => datum.label === "HTML")?.data[0].value;
  if (!domain || !html) {
    return [];
  }
  return RULES.flatMap((rule) => rule(html, domain));
};
const exports = { parse };
export default exports;
