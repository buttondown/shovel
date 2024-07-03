import fetch from "@/lib/data";
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

  return (
    <div className="font-mono bg-gray-900 min-h-screen text-white p-4 pt-0">
      <nav className="font-black flex items-center sticky top-0 py-4 bg-gray-900 z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6 text-blue-500"
        >
          <path d="M11.625 16.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75Z" />
          <path
            d="M5.625 1.5H9a3.75 3.75 0 0 1 3.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 0 1 3.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 0 1-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875Zm6 16.5c.66 0 1.277-.19 1.797-.518l1.048 1.048a.75.75 0 0 0 1.06-1.06l-1.047-1.048A3.375 3.375 0 1 0 11.625 18Z"
            clipRule="evenodd"
          />
          <path d="M14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z" />
        </svg>

        <header className="inline-block px-2 py-1 pr-0 text-gray-400">
          shovel.report/
        </header>
        <a
          href={`https://${params.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block hover:bg-white/20 transition-colors"
        >
          {params.domain}
        </a>
      </nav>
      <div className="p-8 pt-0 overflow-x-scroll max-w-screen">
        <SectionHeader>DNS Records</SectionHeader>
        <table className="">
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
