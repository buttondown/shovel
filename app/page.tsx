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
        We developed it at Buttondown to help us understand the technical
        details of our customers&apos; websites, and we are excited to share it
        with you.
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
        <ul
          className="
            grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 w-screen gap-[1px] -mx-12 bg-gray-600 border-y border-y-gray-600
        "
        >
          {Object.values(REGISTRY)
            .toSorted((a, b) => a.identifier.localeCompare(b.identifier))
            .map((service) => (
              <li
                key={service.identifier}
                className="whitespace-nowrap flex flex-col items-center justify-center bg-gray-800 py-4"
              >
                <img
                  src={`https://icon.horse/icon/${
                    new URL(service.url).hostname
                  }`}
                  className="h-5 w-5 inline-block mb-1"
                />
                <span>{service.name}</span>
              </li>
            ))}
        </ul>
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
