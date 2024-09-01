import DomainIcon from "@/components/DomainIcon";
import Grid from "@/components/Grid";
import SectionHeader from "@/components/SectionHeader";
import fetch from "@/lib/data";
import { db } from "@/lib/db/connection";
import { GENRE_REGISTRY, REGISTRY } from "@/lib/services";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { domain: string };
};

const generateURLForSocialMedia = (service: string, username: string) => {
  if (service === "twitter") {
    return `https://twitter.com/${username}`;
  }
  if (service === "linkedin") {
    return `https://linkedin.com/in/${username}`;
  }
  if (service === "facebook") {
    return `https://facebook.com/${username}`;
  }
  if (service === "instagram") {
    return `https://instagram.com/${username}`;
  }
  if (service === "youtube") {
    return `https://youtube.com/${username}`;
  }
  if (service === "tiktok") {
    return `https://tiktok.com/@${username}`;
  }
  if (service === "bluesky") {
    return `https://bsky.social/${username}`;
  }
  if (service === "github") {
    return `https://github.com/${username}`;
  }
  return "";
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: params.domain + " - shovel.report",
    description:
      "Information about " +
      params.domain +
      " and its DNS records, technologies, social media and more.",
  };
}

const ServicePill = ({ service }: { service: string }) => {
  const technology = REGISTRY[service];
  if (!technology) {
    return <span>{service}</span>;
  }
  if (technology.icon) {
    return <div className="inline-flex items-center">{technology.icon}</div>;
  }
  if (technology.url) {
    return <DomainIcon domain={new URL(technology.url).hostname} />;
  }
  return <span>{service}</span>;
};

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

  const existingTechSet = new Set(
    existingTechnologies.map((tech) => tech.technology)
  );

  const newTechnologies = data.notes
    .filter(
      (note) =>
        ["SERVICE"].includes(note.label) &&
        !existingTechSet.has(note.metadata.value)
    )
    .map((note) => ({
      domain: params.domain,
      technology: note.metadata.value,
      data: JSON.stringify(note.metadata),
      creation_date: new Date().toISOString(),
    }));

  if (newTechnologies.length > 0) {
    await db
      .insertInto("detected_technologies")
      .values(newTechnologies)
      .execute();
  }

  return (
    <div className="">
      <a
        href={`https://${params.domain}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 hover:bg-white/20 transition-colors font-black text-xl"
      >
        <DomainIcon domain={params.domain} />
        <span>{params.domain}</span>
      </a>
      <SectionHeader>DNS Records</SectionHeader>
      <table className="">
        <tbody>
          {data.data
            .filter((datum) => datum.label === "DNS")
            .flatMap((datum) =>
              datum.data.map((record) => (
                <tr key={record.value}>
                  <td className="pr-4">{record.type}</td>
                  <td className="">{record.value}</td>
                </tr>
              ))
            )}
        </tbody>
      </table>
      <SectionHeader>Tranco ranking</SectionHeader>
      <ul>
        {data.data
          .filter((datum) => datum.label === "Tranco")
          .flatMap((datum) =>
            datum.data.map((record) => (
              <li key={record.value}>#{record.value}</li>
            ))
          )}
        <ul className="only:block hidden opacity-50">No Tranco record found</ul>
      </ul>
      <SectionHeader>Subdomains</SectionHeader>
      <Grid.Container>
        {data.notes
          .filter((datum) => datum.label === "SUBDOMAIN")
          .map((note, i) => (
            <Grid.Item key={i} url={`/domain/${note.metadata.value}`}>
              {note.metadata.value}
            </Grid.Item>
          ))}
      </Grid.Container>
      <SectionHeader>Services</SectionHeader>
      <Grid.Container>
        {data.notes
          .filter((datum) => datum.label === "SERVICE")
          .filter((note) => REGISTRY[note.metadata.value])
          .map((note, i) => (
            <Grid.Item
              key={i}
              url={`/technology/${note.metadata.value}`}
              domain={new URL(REGISTRY[note.metadata.value]?.url).hostname}
            >
              <div>{REGISTRY[note.metadata.value]?.name}</div>
              <div className="text-gray-400 text-sm">
                {GENRE_REGISTRY[REGISTRY[note.metadata.value]?.genre].name}
              </div>
            </Grid.Item>
          ))}
      </Grid.Container>
      <SectionHeader>Social media</SectionHeader>
      <Grid.Container>
        {data.notes
          .filter((datum) => datum.label === "SERVICE")
          .filter(
            (note) => REGISTRY[note.metadata.value]?.genre === "social_media"
          )
          .map((note, i) => (
            <Grid.Item
              key={i}
              url={generateURLForSocialMedia(
                note.metadata.value,
                note.metadata.username
              )}
              domain={new URL(REGISTRY[note.metadata.value]?.url).hostname}
            >
              <div>{note.metadata.username}</div>
              <div className="text-gray-400 text-sm">
                {REGISTRY[note.metadata.value]?.name}
              </div>
            </Grid.Item>
          ))}
      </Grid.Container>
      <SectionHeader>DMARC</SectionHeader>
      <ul>
        {data.data
          .filter((datum) => datum.label === "DMARC")
          .flatMap((datum) =>
            datum.data.map((record) => (
              <li key={record.value}>{record.value}</li>
            ))
          )}
        <ul className="only:block hidden opacity-50">No DMARC record found</ul>
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
                data.notes.find((datum) => datum.label === "JSON+LD")?.metadata
                  .value || "{}"
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
  );
}
