const DISABLE_ICONHORSE = process.env.DISABLE_ICONHORSE === "true";

const DomainIcon = ({ domain }: { domain: string }) => {
  if (DISABLE_ICONHORSE) {
    return null;
  }
  return <img src={`https://icon.horse/icon/${domain}`} className="h-5 w-5 inline-block" />;
};

export default DomainIcon;
