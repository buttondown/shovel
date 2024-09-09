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
    <div className="max-w-prose">
      <span className="font-bold">Shovel</span> is a tool to help you dig into
      the details of a website. Think of it as `dig` or `nslookup`, but way
      better, plus a splash of `BuiltWith`.
      <br />
      <br />
      We developed it at Buttondown to help us understand the technical details
      of our customers&apos; websites, and we are excited to share it with you.
      <br />
      <br />
      <br />
      <br />
      <h2 className="font-bold">How to use it</h2>
      <br />
      You can ask basic questions like &quot;what domain records and
      technologies are used by Vercel?&quot;:
      <br />
      <br />
      <a
        className="bg-white/10 p-2 hover:bg-white/20 transition-colors"
        href="
            https://shovel.report/domain/vercel.com
        "
      >
        shovel.report/domain/vercel.com
      </a>
      <br />
      <br />
      You can also retrieve this information programmatically, and get a JSON
      response (though at the moment, the API is neither stable nor documented):
      <br />
      <br />
      <a
        className="bg-white/10 p-2 hover:bg-white/20 transition-colors"
        href="
            https://shovel.report/api/v1/domain/vercel.com
        "
      >
        shovel.report/api/v1/domain/vercel.com
      </a>
      <br />
      <br />
      Or you can ask more complex questions, like &quot;what domains are using
      both Mailgun and Cloudflare?&quot;:
      <br />
      <br />
      <a
        className="bg-white/10 p-2 hover:bg-white/20 transition-colors"
        href="
            https://shovel.report/technology/cloudflare/and/mailgun
        "
      >
        shovel.report/technology/cloudflare/and/mailgun
      </a>
      <br />
      <br />
      <br />
      <br />
      <h2 className="font-bold">What we are tracking</h2>
      <br />
      We are tracking {Object.keys(REGISTRY).length} technologies across the
      following genres:
      <br />
      <br />
      <ol className="list-inside list-disc space-y-4">
        {Object.entries(GENRE_REGISTRY).map(([genre, { name }]) => (
          <li key={genre} className="m-2">
            <a
              href={`/genre/${genre}`}
              className="bg-white/10 p-2 hover:bg-white/20 transition-colors"
            >
              {name}
            </a>
          </li>
        ))}
      </ol>
      <br />
      <br />
      We&apos;ve logged {data[0].count} detections.
      <br />
      <br />
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
      <br />
      <br />
      Any questions? Reach out to us on{" "}
      <a href="https://twitter.com/buttondown" className="underline">
        Twitter
      </a>{" "}
      or{" "}
      <a href="https://github.com/buttondown/shovel" className="underline">
        GitHub
      </a>
      .
    </div>
  );
}
