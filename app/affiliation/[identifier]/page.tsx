import Grid from "@/components/Grid";
import Header from "@/components/Header";
import { REGISTRY } from "@/lib/affiliations/registry";
import { db } from "@/lib/db/connection";
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
    description: `Information about domains affiliated with ${service.name}.`,
    alternates: {
      canonical: `/affiliation/${params.identifier}`,
    },
  };
}

export default async function AffiliationPage({
  params,
}: {
  params: { identifier: string };
}) {
  const service = REGISTRY[params.identifier];
  const data = process.env.DISABLE_DATABASE
    ? { data: [], moreCount: 0 }
    : await db
        .selectFrom("affiliations")
        .where("affiliations.identifier", "=", params.identifier)
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

  return (
    <div className="">
      {service ? (
        <>
          <Header url={`/affiliation/${params.identifier}`}>
            {service.name}
          </Header>
          <div className="flex flex-col items-start">
            <a
              className="text-gray-400 text-sm hover:text-gray-300 hover:bg-white/10"
              target="_blank"
              href={service.domain}
            >
              {service.domain}
            </a>
          </div>
        </>
      ) : (
        <div>Unknown technology</div>
      )}

      <Grid.Container title={"Domains affiliated with " + service.name + ":"}>
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
    </div>
  );
}
