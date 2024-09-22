import Grid from "@/components/Grid";
import Header from "@/components/Header";
import { db } from "@/lib/db/connection";
import { GENRE_REGISTRY, REGISTRY } from "@/lib/services";
import * as Dialog from "@radix-ui/react-dialog";

const PAGE_SIZE = 101;

const SHOVEL_PRO_URL = process.env.SHOVEL_PRO_URL;

import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { identifier: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const service = REGISTRY[params.identifier];

  return {
    title: `${service.name} - shovel.report`,
    description: `Information about ${service.name}, including domains using this technology, DNS records, social media, and more.`,
    alternates: {
      canonical: `/technology/${params.identifier}`,
    },
  };
}

export default async function TechnologyPage({
  params,
}: {
  params: { identifier: string };
}) {
  const service = REGISTRY[params.identifier];
  const data = process.env.DISABLE_DATABASE
    ? { data: [], moreCount: 0 }
    : await db
        .selectFrom("detected_technologies")
        .where("technology", "=", params.identifier)
        .selectAll()
        .distinctOn("domain")
        .execute()
        .then((results) => {
          if (results.length > PAGE_SIZE) {
            const moreCount = results.length - PAGE_SIZE;
            return {
              data: results.slice(0, PAGE_SIZE),
              moreCount,
            };
          }
          return {
            data: results,
            moreCount: 0,
          };
        });

  const technologyCounts = process.env.DISABLE_DATABASE
    ? []
    : await db
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

  const trancoCount = process.env.DISABLE_DATABASE
    ? 0
    : await db
        .selectFrom("affiliations")
        .innerJoin(
          "detected_technologies",
          "affiliations.domain",
          "detected_technologies.domain"
        )
        .where("detected_technologies.technology", "=", params.identifier)
        .where("affiliations.identifier", "=", "tranco")
        .select(db.fn.count("affiliations.domain").as("count"))
        .executeTakeFirst()
        .then((result) => Number(result?.count || 0));

  return (
    <div className="">
      {service ? (
        <>
          <Header url={`/technology/${params.identifier}`}>
            {service.name}
          </Header>
          <div className="flex flex-col items-start">
            <a
              className="text-gray-400 capitalize text-sm inline-block hover:text-gray-300 hover:bg-white/10"
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
            <div className="text-sm text-gray-400">
              {trancoCount} notable domains (
              {trancoCount > 0
                ? (
                    (trancoCount * 100) /
                    (data.data.length + data.moreCount)
                  ).toFixed(2)
                : "0.00"}
              %) / {data.data.length + data.moreCount} total domains
            </div>
          </div>
        </>
      ) : (
        <div>Unknown technology</div>
      )}

      <Grid.Container title="Domains using this technology:">
        {data.data.map((item) => (
          <Grid.Item
            key={item.domain}
            domain={item.domain}
            url={`/domain/${item.domain}`}
          >
            <div className="text-xs">{item.domain}</div>
          </Grid.Item>
        ))}
        {data.moreCount > 0 && (
          <Grid.Item>
            <div className="text-xs opacity-50">
              {/* Note: This component should be moved to a client-side component */}
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button className="hover:underline focus:outline-none">
                    + {data.moreCount} more
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/75" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-lg text-white font-mono">
                    <Dialog.Title className="text-sm mb-1 font-bold">Upgrade to Pro</Dialog.Title>
                    <Dialog.Description className="mb-4 text-sm text-gray-400">
                        Get the full list for just $299.
                    </Dialog.Description>
                    <div className="flex justify-end">
                      <Dialog.Close asChild>
                        <a className="w-full py-2 bg-blue-500 text-white rounded-md text-sm font-bold hover:bg-blue-600 block text-center" href={SHOVEL_PRO_URL}>
                          Upgrade
                        </a>
                      </Dialog.Close>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </Grid.Item>
        )}
      </Grid.Container>

      <Grid.Container title="Other technologies found on the same domains:">
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
              <div className="text-xs">
                {item.count} (
                {(
                  (Number(item.count) * 100) /
                  (data.data.length + data.moreCount)
                ).toFixed(2)}
                %)
              </div>
            </Grid.Item>
          ))}
      </Grid.Container>
    </div>
  );
}
