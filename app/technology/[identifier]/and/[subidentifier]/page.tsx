import Grid from "@/components/Grid";
import Header from "@/components/Header";
import SectionHeader from "@/components/SectionHeader";
import { db } from "@/lib/db/connection";
import { REGISTRY } from "@/lib/services";

import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { identifier: string; subidentifier: string };
};

const PAGE_SIZE = 17;

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const service1 = REGISTRY[params.identifier];
  const service2 = REGISTRY[params.subidentifier];

  return {
    title: `${service1.name} and ${service2.name} - shovel.report`,
    description: `Information about domains using both ${service1.name} and ${service2.name}, including DNS records, technologies, social media, and more.`,
    alternates: {
      canonical: `/technology/${params.identifier}/and/${params.subidentifier}`,
    },
  };
}

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
    .execute()
    .then((data) => {
      const total = data.length;
      const hasMore = total > PAGE_SIZE;
      return { data: data.slice(0, PAGE_SIZE), hasMore, total };
    });

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

      <SectionHeader>
        {data.total} domains detected using both{" "}
        <a
          href={`/technology/${params.identifier}`}
          className="underline hover:bg-white/10"
        >
          {service1.name}
        </a>{" "}
        and{" "}
        <a
          href={`/technology/${params.subidentifier}`}
          className="underline hover:bg-white/10"
        >
          {service2.name}
        </a>
        :
      </SectionHeader>
      <Grid.Container>
        {data.data.map((item) => (
          <Grid.Item
            key={item.domain}
            domain={item.domain}
            url={`/domain/${item.domain}`}
          >
            <div className="text-xs">{item.domain}</div>
            <div className="text-gray-400 text-xs">
              {item.creation_date.toLocaleDateString()}
            </div>
          </Grid.Item>
        ))}
        {data.hasMore && (
          <Grid.Item>
            <div className="text-xs opacity-50">
              + {data.total - data.data.length} more
            </div>
          </Grid.Item>
        )}
        {data.data.length === 0 && (
          <Grid.Item>
            <div className="text-xs opacity-50">No examples found</div>
          </Grid.Item>
        )}
      </Grid.Container>

      <SectionHeader>
        Other technologies found on the same domains:
      </SectionHeader>
      <Grid.Container>
        {technologyCounts
          .filter((item) => item.technology in REGISTRY)
          .map((item) => (
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
