import DomainIcon from "@/components/DomainIcon";
import TechnologyPill from "@/components/TechnologyPill";
import { db } from "@/lib/db/connection";
import { REGISTRY } from "@/lib/services";

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-bold mt-4 text-gray-400">{children}</h2>
);

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
    <div className="p-4 pt-8">
      <h1 className="font-black text-2xl mb-4">
        Domains using both {service1.name} and {service2.name}
      </h1>

      <SectionHeader>Found on:</SectionHeader>
      <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {data.map((item) => (
          <div
            key={item.domain}
            className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg shadow-md border border-white/15 hover:bg-white/15 hover:border-white/20 transition-colors duration-200"
          >
            <DomainIcon domain={item.domain} />
            <a href={`/${item.domain}`} className="block whitespace-nowrap">
              {item.domain}
            </a>
            <div className="text-gray-400 text-xs">
              {item.creation_date.toLocaleDateString()}
            </div>
          </div>
        ))}
        <li className="only:block hidden opacity-50 col-span-2">
          No examples found
        </li>
      </ul>

      <SectionHeader>
        Other technologies found on the same domains:
      </SectionHeader>
      <ul className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {technologyCounts.map((item) => (
          <TechnologyPill
            key={item.technology}
            technology={item.technology}
            subtitle={item.count.toString()}
          />
        ))}
      </ul>
    </div>
  );
}
