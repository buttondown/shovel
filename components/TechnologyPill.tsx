import { REGISTRY } from "@/lib/services";
import DomainIcon from "./DomainIcon";

type Props = {
  technology: string;
  subtitle?: string;
};

const ServicePill = ({ service }: { service: string }) => (
    <div className="inline-flex items-center">
      {REGISTRY[service]?.icon ||
        (REGISTRY[service]?.url ? (
          <DomainIcon domain={
              new URL(REGISTRY[service]?.url).hostname
          } />
        ) : (
          <span>{service}</span>
        ))}
    </div>
  );


const TechnologyPill = ({ technology, subtitle }: Props) => {
  return (
  <a href={`/technology/${technology}`}>
    <li
    className="flex flex-col items-center p-4 bg-white/10 rounded-lg shadow-md border border-white/15 hover:bg-white/15 hover:border-white/20 transition-colors duration-200"
  >
    <ServicePill service={technology} />
    <div className="mt-2 font-bold">{REGISTRY[technology]?.name || technology}</div>
    {subtitle ? (
      <div className="text-xs capitalize text-gray-400">
        {subtitle}
      </div>
    ) : (
      <div className="text-xs capitalize text-gray-400">
        {REGISTRY[technology]?.genre}
      </div>
    )}
    </li>
  </a>
  );
};

export default TechnologyPill;
