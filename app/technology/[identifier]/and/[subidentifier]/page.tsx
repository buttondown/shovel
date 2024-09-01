import Grid from "@/components/Grid";
import Header from "@/components/Header";
import SectionHeader from "@/components/SectionHeader";
import { db } from "@/lib/db/connection";
import { REGISTRY } from "@/lib/services";

export default async function TechnologyAndPage({
  params,
}: {
  params: { identifier: string; subidentifier: string };
}) {
  const service1 = REGISTRY[params.identifier];
  const service2 = REGISTRY[params.subidentifier];
  const data = await db
    .selectFrom("detected_technologies as dt1")
    .innerJoin("detected_technologies as dt2", "dt1.domain", "dt2.domain")
    .where("dt1.technology", "=", params.identifier)
    .where("dt2.technology", "=", params.subidentifier)
    .select(["dt1.domain", "dt1.creation_date"])
    .distinct()
    .execute();

  const technologyCounts = await db
    .selectFrom("detected_technologies")
    .where(
      "domain",
      "in",
      db
        .selectFrom("detected_technologies as dt1")
        .innerJoin("detected_technologies as dt2", "dt1.domain", "dt2.domain")
        .where("dt1.technology", "=", params.identifier)
        .where("dt2.technology", "=", params.subidentifier)
        .select("dt1.domain")
        .distinct()
    )
    .where("technology", "not in", [params.identifier, params.subidentifier])
    .select(["technology"])
    .select(db.fn.count("domain").as("count"))
    .groupBy("technology")
    .orderBy("count", "desc")
    .execute();

  return (
    <div className="">
      <Header
        url={`/technology/${params.identifier}/and/${params.subidentifier}`}
      >
        Domains using both {service1.name} and {service2.name}
      </Header>

      <SectionHeader>Found on:</SectionHeader>
      <Grid.Container>
        {data.map((item) => (
          <Grid.Item
            key={item.domain}
            domain={item.domain}
            url={`/${item.domain}`}
          >
            <div className="text-xs">{item.domain}</div>
            <div className="text-gray-400 text-xs">
              {item.creation_date.toLocaleDateString()}
            </div>
          </Grid.Item>
        ))}
        {data.length === 0 && (
          <Grid.Item>
            <div className="text-xs opacity-50">No examples found</div>
          </Grid.Item>
        )}
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
            url={`/technology/${params.identifier}/and/${item.technology}`}
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
