const Header = ({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block hover:bg-white/20 transition-colors font-black text-xl"
    >
      {children}
    </a>
  );
};

export default Header;
