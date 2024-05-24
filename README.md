# Architecture

There are two types of plugins: `loaders` and `parsers`.

- `loaders` collect raw data about a given domain (whois, HTML, DNS.)
- `parsers` query that raw data to create `Notes` (this domain uses Mailgun; their HTML contains a reference to Fathom).
