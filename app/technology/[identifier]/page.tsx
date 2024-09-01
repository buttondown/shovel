import Grid from "@/components/Grid";
import Header from "@/components/Header";
import SectionHeader from "@/components/SectionHeader";
import { db } from "@/lib/db/connection";
import { GENRE_REGISTRY, REGISTRY } from "@/lib/services";

export default async function TechnologyPage({
  params,
}: {
  params: { identifier: string };
}) {
  const service = REGISTRY[params.identifier];
  const data = await db
    .selectFrom("detected_technologies")
    .where("technology", "=", params.identifier)
    .selectAll()
    .distinctOn("domain")
    .execute();

  const technologyCounts = await db
    .selectFrom("detected_technologies")
    .where(
      "domain",
      "in",
      db
        .selectFrom("detected_technologies")
        .where("technology", "=", params.identifier)
        .select("domain")
    )
    // Exclude the current technology
    .where("technology", "!=", params.identifier)
    .select(["technology"])
    .select(db.fn.count("technology").as("count"))
    .groupBy("technology")
    .orderBy("count", "desc")
    .execute();

  return (
    <div className="p-4 pt-8">
      {service ? (
        <>
          <Header url={`/technology/${params.identifier}`}>
            {service.name}
          </Header>
          <div className="flex flex-col items-start">
            <a
              className="text-gray-400 capitalize text-md inline-block hover:text-gray-300 hover:bg-white/10"
              href={`/genre/${service.genre}`}
            >
              {GENRE_REGISTRY[service.genre].name}
            </a>
            <a
              className="text-gray-400 text-sm hover:text-gray-300 hover:bg-white/10"
              target="_blank"
              href={service.url}
            >
              {service.url}
            </a>
          </div>
        </>
      ) : (
        <div>Unknown technology</div>
      )}

      <SectionHeader>Found on:</SectionHeader>
      <Grid.Container>
        {data.map((item) => (
          <Grid.Item
            key={item.domain}
            domain={item.domain}
            url={`/${item.domain}`}
          >
            <div className="text-xs">{item.domain}</div>
          </Grid.Item>
        ))}
      </Grid.Container>

      <SectionHeader>
        Other technologies found on the same domains:
      </SectionHeader>
      <Grid.Container>
        {technologyCounts.map((item) => (
          <Grid.Item
            key={item.technology}
            domain={
              item.technology in REGISTRY
                ? new URL(REGISTRY[item.technology]?.url).hostname
                : undefined
            }
            url={`/technology/${item.technology}`}
          >
            {item.technology in REGISTRY
              ? REGISTRY[item.technology]?.name
              : item.technology}
            <div className="text-xs">{item.count}</div>
          </Grid.Item>
        ))}
      </Grid.Container>
    </div>
  );
}