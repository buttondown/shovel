import Grid from "@/components/Grid";
import Header from "@/components/Header";
import { db } from "@/lib/db/connection";
import { Genre, GENRE_REGISTRY, REGISTRY } from "@/lib/services";

import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { genre: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const genre = GENRE_REGISTRY[params.genre as Genre];

  return {
    title: `${genre.name} - shovel.report`,
    description: `Information about domains using ${genre.name}, including DNS records, technologies, social media, and more.`,
  };
}

export default async function GenrePage({ params }: Props) {
  const services = Object.values(REGISTRY)
    .filter((service) => service.genre === params.genre)
    .sort((a, b) => a.name.localeCompare(b.name));

  const data = process.env.DISABLE_DATABASE
    ? []
    : await db
        .selectFrom("detected_technologies")
        .where(
          "technology",
          "in",
          services.map((service) => service.identifier)
        )
        .select(["technology"])
        .select(db.fn.count("domain").as("count"))
        .groupBy("technology")
        .execute();

  const technologyToCount = data.reduce((acc, curr) => {
    acc[curr.technology] = Number(curr.count);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="">
      <Header url={`/genre/${params.genre}`}>
        {GENRE_REGISTRY[params.genre as Genre].name}
      </Header>
      <p className="mb-4">
        {GENRE_REGISTRY[params.genre as Genre].description}
      </p>
      {services.length > 0 ? (
        <Grid.Container>
          {services.map((service) => (
            <Grid.Item
              key={service.identifier}
              url={`/technology/${service.identifier}`}
              domain={new URL(service.url).hostname}
            >
              {service.name}
              <span className="text-gray-500 text-sm">
                {technologyToCount[service.identifier] ?? 0} domains
              </span>
            </Grid.Item>
          ))}
        </Grid.Container>
      ) : (
        <p className="text-xl text-gray-600">
          No services found for this genre.
        </p>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const genres = Object.keys(GENRE_REGISTRY);

  return genres.map((genre) => ({
    genre,
  }));
}
