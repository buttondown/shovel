import { db } from "@/lib/db/connection";
import { REGISTRY } from "@/lib/services";


const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <h2 className="font-bold mt-4 text-gray-400">{children}</h2>
  );


export default async function TechnologyPage({ params }: { params: { identifier: string } }) {
  const service = REGISTRY[params.identifier];
  const data = await db.selectFrom("detected_technologies")
    .where("technology", "=", params.identifier)
    .selectAll()
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
          <div key={item.domain}>
            <a href={`/${item.domain}`}>{item.domain}</a>
          </div>
        ))}
        <li className="only:block hidden opacity-50 col-span-2">
          No examples found
        </li>
      </ul>
    </div>
  )
}
