import DomainIcon from "@/components/DomainIcon";
import SectionHeader from "@/components/SectionHeader";

const Container = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <div className="flex flex-col-reverse">
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 w-screen gap-[1px] -mx-8 my-8 border-t border-gray-600 empty:hidden peer">
        {children}
      </div>
      {title && (
        <div className="peer-empty:hidden">
          <SectionHeader>{title}</SectionHeader>
        </div>
      )}
    </div>
  );
};

const Item = ({
  children,
  url,
  domain,
}: {
  children: React.ReactNode;
  url?: string;
  domain?: string;
}) => {
  return (
    <a
      href={url ? url : undefined}
      className="whitespace-nowrap flex flex-col items-center justify-center bg-gray-800 py-4 space-y-1 hover:bg-gray-700 transition-colors border-r border-gray-600 border-b border-gray-600 lg xl:[&:nth-child(6n)]:border-r-0"
    >
      {domain && <DomainIcon domain={domain} />}
      {children}
    </a>
  );
};

export default { Container, Item };
