import DomainSearchForm from "@/components/DomainSearchForm";
import Grid from "@/components/Grid";
import { db } from "@/lib/db/connection";
import { GENRE_REGISTRY, REGISTRY } from "@/lib/services";

export const metadata = {
  title: "shovel.report",
  description: "A tool to help you dig into the details of a website.",
};

export default async function Home() {
  const data = process.env.DISABLE_DATABASE
    ? [{
        count: 0
    }]
    : await db
        .selectFrom("detected_technologies")
        .select(db.fn.countAll<number>().as("count"))
    .execute();

  return (
    <div className="max-w-prose space-y-6">
      <p className="leading-relaxed">
        <span className="font-bold">Shovel</span> is a tool to help you dig into
        the details of a website. Think of it as `dig` or `nslookup`, but way
        better, plus a splash of `BuiltWith`.
      </p>
      <p className="leading-relaxed">
        We developed it at Buttondown to help us understand the technical details
        of our customers&apos; websites, and we are excited to share it with you.
      </p>
      <div className="space-y-3">
        <p className="font-medium text-white/90">
          Paste a domain or URL below to view its report.
        </p>
        <DomainSearchForm />
      </div>
      <section className="space-y-3">
        <h2 className="font-bold text-lg">How to use it</h2>
        <p>
          You can ask basic questions like &quot;what domain records and technologies
          are used by Vercel?&quot;
        </p>
        <a
          className="inline-flex w-full items-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10 sm:w-auto"
          href="https://shovel.report/domain/vercel.com"
        >
          shovel.report/domain/vercel.com
        </a>
        <p>
          You can also retrieve this information programmatically, and get a JSON
          response (though at the moment, the API is neither stable nor documented).
        </p>
        <a
          className="inline-flex w-full items-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10 sm:w-auto"
          href="https://shovel.report/api/v1/domain/vercel.com"
        >
          shovel.report/api/v1/domain/vercel.com
        </a>
        <p>
          Or you can ask more complex questions, like &quot;what domains are using both
          Mailgun and Cloudflare?&quot;
        </p>
        <a
          className="inline-flex w-full items-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10 sm:w-auto"
          href="https://shovel.report/technology/cloudflare/and/mailgun"
        >
          shovel.report/technology/cloudflare/and/mailgun
        </a>
      </section>
      <section className="space-y-3">
        <h2 className="font-bold text-lg">What we are tracking</h2>
        <p>
          We are tracking {Object.keys(REGISTRY).length} technologies across the
          following genres:
        </p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {Object.entries(GENRE_REGISTRY).map(([genre, { name }]) => (
            <li key={genre}>
              <a
                href={`/genre/${genre}`}
                className="flex items-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
              >
                {name}
              </a>
            </li>
          ))}
        </ol>
      </section>
      <section className="space-y-3">
        <p>We&apos;ve logged {data[0].count} detections.</p>
        <Grid.Container>
          {Object.values(REGISTRY)
            .sort((a, b) => a.identifier.localeCompare(b.identifier))
            .map((service) => (
              <Grid.Item
                key={service.identifier}
                domain={new URL(service.url).hostname}
                url={`/technology/${service.identifier}`}
              >
                <div className="text-xs">{service.name}</div>
              </Grid.Item>
            ))}
        </Grid.Container>
      </section>
      <p>
        Any questions? Reach out to us on{" "}
        <a href="https://twitter.com/buttondown" className="underline">
          Twitter
        </a>{" "}
        or{" "}
        <a href="https://github.com/buttondown/shovel" className="underline">
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
