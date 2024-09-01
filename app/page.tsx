import Grid from "@/components/Grid";
import { REGISTRY } from "@/lib/services";

export const metadata = {
  title: "shovel.report",
  description: "A tool to help you dig into the details of a website.",
};

export default function Home() {
  return (
    <div className="p-4 pt-8 max-w-prose">
      <span className="font-bold">Shovel</span> is a tool to help you dig into
      the details of a website. Think of it as `dig` or `nslookup`, but way
      better, plus a splash of `BuiltWith`.
      <br />
      <br />
      We developed it at Buttondown to help us understand the technical details
      of our customers&apos; websites, and we are excited to share it with you.
      <br />
      <br />
      Get started by entering a domain in the URL bar, like:
      <br />
      <br />
      <a
        className="bg-white/10 p-2 hover:bg-white/20 transition-colors"
        href="
            https://shovel.report/vercel.com
        "
      >
        shovel.report/vercel.com
      </a>
      <br />
      <br />
      We are tracking {Object.keys(REGISTRY).length} services:
      <br />
      <br />
      <Grid.Container>
        {Object.values(REGISTRY)
          .toSorted((a, b) => a.identifier.localeCompare(b.identifier))
          .map((service) => (
            <Grid.Item
              key={service.identifier}
              domain={service.url}
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
