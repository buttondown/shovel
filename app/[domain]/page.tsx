import fetch from "@/lib/data";

export const metadata = {
  title: "shovel.report",
  description: "A tool to help you dig into the details of a website.",
};

const ServicePill = ({ service }: { service: string }) => (
  <div className="inline-flex items-center">
    <div className="text-white">{service}</div>
  </div>
);

export default async function Page({
  params,
}: {
  params: {
    domain: string;
  };
}) {
  const data = await fetch(params.domain);

  return (
    <div className="font-mono bg-gray-900 min-h-screen text-white p-8">
      <nav className="font-black">
        <header className="rotate-[-3deg] bg-blue-500 inline-block px-2 py-1">
          shovel.report
        </header>
      </nav>
      <div className="p-4">
        <h2 className="font-bold mt-4 text-gray-400">DNS Records</h2>
        <table>
          {data.data
            .filter((datum) => datum.label === "DNS")
            .flatMap((datum) =>
              datum.data.map((record) => (
                <tr key={record.value}>
                  <td className="pr-4">{record.type}</td>
                  <td>{record.value}</td>
                </tr>
              ))
            )}
        </table>
        <h2 className="font-bold mt-4 text-gray-400">DNS Notes</h2>
        <ul>
          {data.notes.map((note, i) => (
            <li key={i}>
              <ServicePill service={note.label} />{" "}
              {Object.keys(note.metadata).length > 0 &&
                JSON.stringify(note.metadata)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
