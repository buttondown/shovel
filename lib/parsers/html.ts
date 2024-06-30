import { parse as parseHTML } from "node-html-parser";
import { Note, Parser } from "./types";

const SUBSTRING_TO_PROVIDER = {
  "cdn.usefathom.com": "Fathom",
  "data-rewardful": "Rewardful",
  "cdn.segment.com": "Segment",
  "omappapi.com": "OptinMonster",
  "_next/static/": "Next.js",
  "nr-data.net": "New Relic",
  "cloudfront.net": "AWS CloudFront",
  "js.stripe.com": "Stripe",
  "Built with Framer": "Framer",
  "googletagmanager.com": "Google Tag Manager",
  "assets.squarespace.com": "Squarespace",
  'rel="webmention"': "Webmention",
  "plausible.io/js": "Plausible",
  'name="generator" content="Ghost': "Ghost",
  'name="generator" content="Gatsby': "Gatsby",
  "view.flodesk.com": "Flodesk",
  "content='blogger' name='generator'": "Blogger",
  "cdn.shopify.com": "Shopify",
  "data-beehiiv": "Beehiiv",
  "wp-content/plugins": "WordPress",
  "/convertkit/": "ConvertKit",
  "static.mailerlite.com": "MailerLite",
  "filekitcdn.com": "ConvertKit",
  "list-manage.com": "Mailchimp",
  bubble_page_load_id: "Bubble",
  "window.groove": "Groove",
  "intercom.com": "Intercom",
  "/js/webflow": "Webflow",
  "data-turbo": "Hotwire",
  "revue-form": "Revue",
  'action="https://tinyletter.com': "TinyLetter",
  GoogleAnalyticsObject: "Google Analytics",
  "fast.wistia.com": "Wistia",
  "hs-banner.com": "HubSpot",
  "ahrefs-site-verification": "Ahrefs",
  "code.jquery.com": "jQuery",
  "ns1.digitaloceanspaces.com": "DigitalOcean",
  "simplecastcdn.com": "Simplecast",
  "h,o,t,j,a,r": "Hotjar",
  "c,l,a,r,i,t,y": "Microsoft Clarity",
  "assets.apollo.io": "Apollo",
  "Wix.com Website Builder": "Wix",
};

const PATREON_RULE = (html: string) => {
  // Match on `<a href="https://twitter.com/username"> and pull out the username.
  // Make sure to avoid matching on twitter.com/intent.
  const match = html.match(/href="https:\/\/www.patreon.com\/([^\/"]+)"/);
  if (match) {
    const username = match[1];
    return [
      {
        label: "SOCIAL_MEDIA",
        metadata: { username, service: "Patreon" },
      },
    ];
  }
  return [];
};

const TWITTER_RULE = (html: string) => {
  // Match on `<a href="https://twitter.com/username"> and pull out the username.
  // Make sure to avoid matching on twitter.com/intent.
  const match = html.match(/<a href="https:\/\/twitter.com\/([^\/"]+)"/);
  if (match) {
    const username = match[1];
    return [
      {
        label: "SOCIAL_MEDIA",
        metadata: { username, service: "Twitter" },
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
    return [
      {
        label: "SOCIAL_MEDIA",
        metadata: { username, service: "Twitter" },
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

const SAME_AS_URL_TO_SOCIAL_MEDIA_SERVICE: {
  [key: string]: string;
} = {
  "www.facebook.com": "Facebook",
  "twitter.com": "Twitter",
  "www.instagram.com": "Instagram",
  "www.linkedin.com": "LinkedIn",
  "www.pinterest.com": "Pinterest",
  "www.youtube.com": "YouTube",
  "www.snapchat.com": "Snapchat",
  "www.tiktok.com": "TikTok",
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
            const service =
              SAME_AS_URL_TO_SOCIAL_MEDIA_SERVICE[new URL(url).hostname];
            if (!service) {
              return [];
            }
            return [
              {
                label: "SOCIAL_MEDIA",
                metadata: { service, username: url },
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
        metadata: { href },
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
  ...Object.entries(SUBSTRING_TO_PROVIDER).map(([substring, provider]) => {
    return (html: string) => {
      if (html.includes(substring)) {
        return [
          {
            label: "SERVICE",
            metadata: {
              value: provider,
            },
          },
        ];
      }
      return [];
    };
  }),
  TWITTER_RULE,
  PATREON_RULE,
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
