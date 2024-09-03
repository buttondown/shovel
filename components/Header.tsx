const Header = ({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) => {
  return (
    <h1>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block hover:bg-white/20 transition-colors font-black text-xl"
      >
        {children}
      </a>
    </h1>
  );
};

export default Header;
