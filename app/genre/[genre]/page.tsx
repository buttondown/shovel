import Grid from "@/components/Grid";
import Header from "@/components/Header";
import { Genre, GENRE_REGISTRY, REGISTRY } from "@/lib/services";

export default async function GenrePage({
  params,
}: {
  params: { genre: Genre };
}) {
  const services = Object.values(REGISTRY)
    .filter((service) => service.genre === params.genre)
    .sort((a, b) => a.name.localeCompare(b.name));

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
