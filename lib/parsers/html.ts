import { parse as parseHTML } from "node-html-parser";
import { Note, Parser } from "./types";

const SUBSTRING_TO_PROVIDER = {
  "cdn.usefathom.com": "Fathom",
  "data-rewardful": "Rewardful",
  ".getrewardful.com": "Rewardful",
  "cdn.segment.com": "Segment",
  "omappapi.com": "OptinMonster",
  "_next/static/": "Next.js",
  "nr-data.net": "New Relic",
  "termly.io": "Termly",
  "data-drip": "Drip",
  "chatbase.co/embed.min.js": "Chatbase",
  "cloudfront.net": "AWS CloudFront",
  "app.loops.so": "Loops",
  "js.stripe.com": "Stripe",
  "gaug.es": "Gauges",
  "Built with Framer": "Framer",
  "profitwell.com/js/profitwell": "ProfitWell",
  _vwo_code: "Visual Website Optimizer",
  "f.fbq": "Facebook Pixel",
  TiktokAnalyticsObject: "TikTok Pixel",
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
  "cdn.outseta.com": "Outseta",
  "klaviyo.init": "Klaviyo",
  __sveltekit__: "Svelte",
  "js.afterpay.com": "Afterpay",
  "zdassets.com": "Zendesk",
  "cookiefirst.com": "CookieFirst",
  livewireScriptConfig: "Laravel",
  "buttondown.email/api": "Buttondown",
  "hs-script-loader": "HubSpot",
  "cdn.yottaa.com": "Yottaa",
  intercomSettings: "Intercom",
  _rollbarConfig: "Rollbar",
  "posthog.init": "PostHog",
  "e.amplitude": "Amplitude",
};

const URL_TO_PROVIDER: {
  [key: string]: string;
} = {
  "patreon.com": "Patreon",
  "twitter.com": "Twitter",
  "x.com": "Twitter",
  "instagram.com": "Instagram",
  "github.com": "GitHub",
  "facebook.com": "Facebook",
  "facebook.com/groups": "Facebook",
  "linkedin.com": "LinkedIn",
  "linkedin.com/company": "LinkedIn",
  "linkedin.com/school": "LinkedIn",
  "pinterest.com": "Pinterest",
  "youtube.com": "YouTube",
  "youtube.com/c": "YouTube",
  "snapchat.com": "Snapchat",
  "tiktok.com": "TikTok",
  "reddit.com/r": "Reddit",
};

const GENERIC_SOCIAL_MEDIA_PROVIDER = (html: string) => {
  const socialMediaProviders = Object.keys(URL_TO_PROVIDER);
  const potentialMatches = socialMediaProviders.filter((provider) =>
    html.includes(provider)
  );
  return potentialMatches.flatMap((potentialMatch) => {
    const match = html.match(
      new RegExp(
        `href=["']https?://(www\.)?${potentialMatch}/([^/"^%]+?)/?["']`
      )
    );
    if (match) {
      const username = match[match.length - 1];
      return [
        {
          label: "SOCIAL_MEDIA",
          metadata: {
            username,
            service:
              URL_TO_PROVIDER[potentialMatch as keyof typeof URL_TO_PROVIDER],
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
        metadata: { username: usernameWithoutQuery, service: "Twitter" },
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
        metadata: { username: usernameWithoutQuery, service: "Twitter" },
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
            const service = URL_TO_PROVIDER[new URL(url).hostname];
            if (!service) {
              return [];
            }
            return [
              {
                label: "SOCIAL_MEDIA",
                metadata: { service, username: url.split("/").pop() },
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
