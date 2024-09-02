import DomainIcon from "@/components/DomainIcon";
import Grid from "@/components/Grid";
import SectionHeader from "@/components/SectionHeader";
import fetch from "@/lib/data";
import { reify } from "@/lib/db/domains";
import { GENRE_REGISTRY, REGISTRY } from "@/lib/services";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { domain: string };
};

const SOCIAL_MEDIA_URL_TEMPLATES: { [key: string]: string } = {
  twitter: "https://twitter.com/",
  linkedin: "https://linkedin.com/in/",
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",
  tiktok: "https://tiktok.com/@",
  bluesky: "https://bsky.social/",
  github: "https://github.com/",
};

const generateURLForSocialMedia = (
  service: string,
  username: string
): string => {
  const template = SOCIAL_MEDIA_URL_TEMPLATES[service];
  return template ? `${template}${username}` : "";
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
  await reify(params.domain, data);

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
      <Grid.Container title="Subdomains">
        {data.detected_technologies
          .filter((datum) => datum.identifier === "subdomain")
          .map((note, i) => (
            <Grid.Item key={i} url={`/domain/${note.metadata.value}`}>
              {note.metadata.value}
            </Grid.Item>
          ))}
      </Grid.Container>
      <Grid.Container title="Services">
        {data.detected_technologies
          .filter((datum) => datum.identifier !== "subdomain")
          .filter((note) => REGISTRY[note.identifier])
          .map((note, i) => (
            <Grid.Item
              key={i}
              url={`/technology/${note.identifier}`}
              domain={new URL(REGISTRY[note.identifier]?.url).hostname}
            >
              <div>{REGISTRY[note.identifier]?.name}</div>
              <div className="text-gray-400 text-sm">
                {GENRE_REGISTRY[REGISTRY[note.identifier]?.genre].name}
              </div>
            </Grid.Item>
          ))}
      </Grid.Container>
      <Grid.Container title="Social media">
        {data.detected_technologies
          .filter((note) => REGISTRY[note.identifier]?.genre === "social_media")
          .map((note, i) => (
            <Grid.Item
              key={i}
              url={generateURLForSocialMedia(
                note.identifier,
                note.metadata.username
              )}
              domain={new URL(REGISTRY[note.identifier]?.url).hostname}
            >
              <div>{note.metadata.username}</div>
              <div className="text-gray-400 text-sm">
                {REGISTRY[note.identifier]?.name}
              </div>
            </Grid.Item>
          ))}
      </Grid.Container>
      <SectionHeader>JSON+LD</SectionHeader>
      <ul>
        {data.detected_technologies.find(
          (datum) => datum.identifier === "jsonld"
        )?.metadata && (
          <pre className="whitespace-pre max-w-full overflow-x-scroll">
            {JSON.stringify(
              JSON.parse(
                data.detected_technologies.find(
                  (datum) => datum.identifier === "jsonld"
                )?.metadata.value || "{}"
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
    </div>
  );
}
