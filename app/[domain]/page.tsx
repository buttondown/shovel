import fetch from "@/lib/data";
import { db } from "@/lib/db/connection";
import { REGISTRY } from "@/lib/services";
import Link from "next/link";

export const metadata = {
  title: "shovel.report",
  description: "A tool to help you dig into the details of a website.",
};

const ServicePill = ({ service }: { service: string }) => (
  <div className="inline-flex items-center">
    {REGISTRY[service]?.icon ||
      (REGISTRY[service]?.url ? (
        <img
          src={`https://icon.horse/icon/${
            REGISTRY[service]?.url
              ? new URL(REGISTRY[service]?.url).hostname
              : service
          }`}
          alt={service}
          className="w-6 h-6"
        />
      ) : (
        <span>{service}</span>
      ))}
  </div>
);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-bold mt-4 text-gray-400">{children}</h2>
);

export default async function Page({
  params,
}: {
  params: {
    domain: string;
  };
}) {
  const data = await fetch(params.domain);
  await db
    .insertInto("domains")
    .values({
      domain: params.domain,
      data: JSON.stringify(data),
    })
    .execute();

  const existingTechnologies = await db
    .selectFrom("detected_technologies")
    .select("technology")
    .where("domain", "=", params.domain)
    .execute();

  const existingTechSet = new Set(existingTechnologies.map(tech => tech.technology));

  const newTechnologies = data.notes
    .filter((note) => note.label === "SERVICE" && !existingTechSet.has(note.metadata.value))
    .map((note) => ({
      domain: params.domain,
      technology: note.metadata.value,
      data: JSON.stringify(note.metadata),
      creation_date: new Date().toISOString(),
    }));

  if (newTechnologies.length > 0) {
    await db.insertInto("detected_technologies")
      .values(newTechnologies)
      .execute();
  }

  return (
    <div className="p-4 pt-8">
        <a
          href={`https://${params.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block hover:bg-white/20 transition-colors font-black text-xl"
        >
          {params.domain}
        </a>
      <div className="overflow-x-scroll max-w-screen">
        <SectionHeader>DNS Records</SectionHeader>
        <table className="">
          <tbody>
            {data.data
              .filter((datum) => datum.label === "DNS")
            .flatMap((datum) =>
              datum.data.map((record) => (
                <tr key={record.value}>
                  <td className="pr-4">{record.type}</td>
                  <td className="whitespace-nowrap">{record.value}</td>
                </tr>
                ))
              )}
          </tbody>
        </table>
        <SectionHeader>Subdomains</SectionHeader>
        <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {data.notes
            .filter((datum) => datum.label === "SUBDOMAIN")
            .map((note, i) => (
              <Link href={`/${note.metadata.value}`} key={i}>
                <li className="flex flex-col whitespace-nowrap items-center p-4 bg-white/10 rounded-lg shadow-md border border-white/15 hover:bg-white/15 hover:border-white/20 transition-colors duration-200">
                  <div className="font-bold">{note.metadata.value}</div>
                </li>
              </Link>
            ))}
          <ul className="only:block hidden opacity-50 col-span-2">
            No subdomains found
          </ul>
        </ul>
        <SectionHeader>Services</SectionHeader>
        <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {data.notes
            .filter((datum) => datum.label === "SERVICE")
            .map((note, i) => (
              <a href={`/technology/${note.metadata.value}`} key={i}>
                <li
                  key={i}
                className="flex flex-col items-center p-4 bg-white/10 rounded-lg shadow-md border border-white/15 hover:bg-white/15 hover:border-white/20 transition-colors duration-200"
              >
                <ServicePill service={note.metadata.value} />
                <div className="mt-2 font-bold">{note.metadata.value}</div>
                {(note.metadata.genre ||
                  REGISTRY[note.metadata.value]?.genre) && (
                  <div className="text-xs capitalize text-gray-400">
                    {note.metadata.genre ||
                      REGISTRY[note.metadata.value]?.genre}
                  </div>
                )}
                </li>
              </a>
            ))}
          <ul className="only:block hidden opacity-50 col-span-2">
            No services found
          </ul>
        </ul>
        <SectionHeader>Social media</SectionHeader>
        <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {data.notes
            .filter((datum) => datum.label === "SOCIAL_MEDIA")
            .map((note, i) => (
              <li
                key={i}
                className="flex flex-col items-center p-4 bg-white/10 rounded-lg shadow-md border border-white/15 hover:bg-white/15 hover:border-white/20 transition-colors duration-200"
              >
                <ServicePill service={note.metadata.service} />
                <div className="mt-2 font-bold">{note.metadata.username}</div>
                <div className="text-xs text-gray-400">
                  {note.metadata.service}
                </div>
              </li>
            ))}
          <ul className="only:block hidden opacity-50 col-span-2">
            No social media accounts found
          </ul>
        </ul>
        <SectionHeader>DMARC</SectionHeader>
        <ul>
          {data.data
            .filter((datum) => datum.label === "DMARC")
            .flatMap((datum) =>
              datum.data.map((record) => (
                <li key={record.value}>{record.value}</li>
              ))
            )}
          <ul className="only:block hidden opacity-50">
            No DMARC record found
          </ul>
        </ul>
        <SectionHeader>BIMI</SectionHeader>
        <ul>
          {data.data
            .filter((datum) => datum.label === "BIMI")
            .flatMap((datum) =>
              datum.data.map((record) => (
                <li key={record.value}>{record.value}</li>
              ))
            )}
          <ul className="only:block hidden opacity-50">No BIMI record found</ul>
        </ul>
        <SectionHeader>ATPROTO</SectionHeader>
        <ul>
          {data.data
            .filter((datum) => datum.label === "ATPROTO")
            .flatMap((datum) =>
              datum.data.map((record) => (
                <li key={record.value}>{record.value}</li>
              ))
            )}
          <ul className="only:block hidden opacity-50">
            No ATPROTO record found
          </ul>
        </ul>
        <SectionHeader>JSON+LD</SectionHeader>
        <ul>
          {data.notes.find((datum) => datum.label === "JSON+LD")?.metadata && (
            <pre className="whitespace-pre max-w-full overflow-x-scroll">
              {JSON.stringify(
                JSON.parse(
                  data.notes.find((datum) => datum.label === "JSON+LD")
                    ?.metadata.value || "{}"
                ),
                null,
                2
              )}
            </pre>
          )}
          <ul className="only:block hidden opacity-50">
            No JSON+LD record found
          </ul>
        </ul>
        <SectionHeader>Notes</SectionHeader>
        <ul>
          {data.notes
            .filter((note) => note.label !== "JSON+LD")
            .filter((note) => note.label !== "SOCIAL_MEDIA")
            .filter((note) => note.label !== "SERVICE")
            .filter((note) => note.label !== "SUBDOMAIN")
            .map((note, i) => (
              <li key={i}>
                <ServicePill service={note.label} />{" "}
                {Object.keys(note.metadata).length > 0 &&
                  JSON.stringify(note.metadata)}
              </li>
            ))}
          <ul className="only:block hidden opacity-50">
            No additional notes found
          </ul>
        </ul>
      </div>
    </div>
  );
}
