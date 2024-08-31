const DomainIcon = ({ domain }: { domain: string }) => {
  return <img src={`https://icon.horse/icon/${domain}`} className="h-5 w-5 inline-block" />;
};

export default DomainIcon;
