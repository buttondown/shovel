import DomainIcon from "@/components/DomainIcon";

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 w-screen gap-[1px] -mx-12 bg-gray-600 border-y border-y-gray-600 my-8">
      {children}
    </div>
  );
};

const Item = ({
  children,
  url,
  domain,
}: {
  children: React.ReactNode;
  url: string;
  domain?: string;
}) => {
  return (
    <a
      href={url}
      className="whitespace-nowrap flex flex-col items-center justify-center bg-gray-800 py-4 space-y-1 hover:bg-gray-700 transition-colors"
    >
      {domain && <DomainIcon domain={domain} />}
      {children}
    </a>
  );
};

export default { Container, Item };
