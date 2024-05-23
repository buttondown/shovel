import dns from "@/lib/dns";
import htmlRules from "@/lib/htmlRules";
import rules from "@/lib/rules";
import { parse } from "node-html-parser";

export const metadata = {
  title: "shovel.report",
  description: "A tool to help you dig into the details of a website.",
};

const ServicePill = ({ service }: { service: string }) => (
  <div className="inline-flex items-center">
    <div className="text-white">{service}</div>
  </div>
);

export default async function Page({
  params,
}: {
  params: {
    domain: string;
  };
}) {
  const domain = params.domain;
  const result = await dns.lookup(domain);
  const html = await fetch(`https://${domain}`).then((res) => res.text());
  const dnsNotes = rules.run(result);
  const htmlNotes = htmlRules.run(html);

  const jsonLD = parse(html).querySelector(
    "script[type='application/ld+json']"
  );
  const rss = parse(html).querySelector("link[type='application/rss+xml']");
  const subdomains = parse(html)
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

  return (
    <div className="font-mono bg-gray-900 min-h-screen text-white p-8">
      <nav className="font-black">
        <header className="rotate-[-3deg] bg-blue-500 inline-block px-2 py-1">
          shovel.report
        </header>
      </nav>
      <div className="p-4">
        <h2 className="font-bold mt-4 text-gray-400">DNS Records</h2>
        <table>
          {result.map((record) => (
            <tr key={record.value}>
              <td className="pr-4">{record.type}</td>
              <td>{record.value}</td>
            </tr>
          ))}
        </table>
        <h2 className="font-bold mt-4 text-gray-400">DNS Notes</h2>
        <ul>
          {dnsNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <h2 className="font-bold mt-4 text-gray-400">Subdomains</h2>
        <ul>
          {subdomains.map((subdomain) => (
            <li key={subdomain.value}>
              <a href={`/${subdomain.value}`}>{subdomain.value}</a>
            </li>
          ))}
        </ul>
        <h2 className="font-bold mt-4 text-gray-400">Detected technologies</h2>
        <ul>
          {htmlNotes.map((note) => (
            <li key={note.label}>
              <ServicePill service={note.label} />{" "}
              {Object.keys(note.metadata).length > 0 &&
                JSON.stringify(note.metadata)}
            </li>
          ))}
        </ul>
        <h2 className="font-bold mt-4 text-gray-400">JSON+LD</h2>
        <pre className="max-w-screen overflow-x-scroll">
          {jsonLD
            ? JSON.stringify(JSON.parse(jsonLD?.text.toString()), null, 2)
            : "No JSON-LD detected"}
        </pre>
        <h2 className="font-bold mt-4 text-gray-400">RSS</h2>
        <pre>{rss?.getAttribute("href") || "No RSS detected"}</pre>
      </div>
    </div>
  );
}
