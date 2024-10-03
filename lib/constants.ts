// The `www` is deliberate; as of this writing, we explicitly redirect from the
// root domain to the `www` subdomain, so a `shovel.report` canonical URL would be
// incorrect (since it would 308 to the `www` subdomain).
export const CANONICAL_URL = "https://www.shovel.report";
