import DomainIcon from "@/components/DomainIcon";
import TechnologyPill from "@/components/TechnologyPill";
import { db } from "@/lib/db/connection";
import { REGISTRY } from "@/lib/services";

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-bold mt-4 text-gray-400">{children}</h2>
);

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
      <a
        href={`/technology/${params.identifier}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block hover:bg-white/20 transition-colors font-black text-xl"
      >
        {service.name}
      </a>
      <div className="">
        <div className="text-gray-400">{service.url}</div>
        <div className="text-gray-400 capitalize">{service.genre}</div>
      </div>

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
