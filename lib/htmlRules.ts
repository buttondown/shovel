type Note = {
  label: string;
  metadata: Record<string, string>;
};

type Rule = (record: string) => Note | null;

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
  "content='blogger' name='generator'": "Blogger",
  "cdn.shopify.com": "Shopify",
  "data-beehiiv": "Beehiiv",
  "wp-content/plugins": "WordPress",
  "/convertkit/": "ConvertKit",
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
};

const TWITTER_RULE = (html: string) => {
  // Match on `<a href="https://twitter.com/username"> and pull out the username.
  const match = html.match(/<a href="https?:\/\/twitter.com\/(.+?)"/);
  if (match) {
    const username = match[1];
    return {
      label: "Twitter",
      metadata: { username },
    };
  }
  return null;
};

const EMAIL_ADDRESS_RULE = (html: string) => {
  // Match on `<a href="https://twitter.com/username"> and pull out the username.
  const match = html.match(/<a href="mailto:(.+?)"/);
  if (match) {
    const username = match[1];
    return {
      label: "Email",
      metadata: { username },
    };
  }
  return null;
};

const RULES: Rule[] = [
  ...Object.entries(SUBSTRING_TO_PROVIDER).map(([substring, provider]) => {
    return (html: string) => {
      if (html.includes(substring)) {
        return {
          label: provider,
          metadata: {},
        };
      }
      return null;
    };
  }),
  TWITTER_RULE,
  EMAIL_ADDRESS_RULE,
];

const filterToUnique = (values: Note[]): Note[] => {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value.label)) {
      return false;
    }
    seen.add(value.label);
    return true;
  });
};

const run = (html: string): Note[] => {
  return filterToUnique(
    RULES.map((rule) => rule(html)).filter(Boolean) as Note[]
  );
};

export default { run };
