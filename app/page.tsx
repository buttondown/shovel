export const metadata = {
  title: "shovel.report",
  description: "A tool to help you dig into the details of a website.",
};

export default function Home() {
  return (
    <div className="font-mono bg-gray-900 min-h-screen text-white p-8">
      <nav className="font-black">
        <header className="rotate-[-3deg] bg-blue-500 inline-block px-2 py-1">
          shovel.report
        </header>
      </nav>
      <div className="p-4 pt-8 max-w-prose">
        <span className="font-bold">Shovel</span> is a tool to help you dig into
        the details of a website. Think of it as `dig` or `nslookup`, but way
        better, plus a splash of `BuiltWith`.
        <br />
        <br />
        We developed it at Buttondown to help us understand the technical
        details of our customers' websites, and we're excited to share it with
        you.
        <br />
        <br />
        Get started by entering a domain in the URL bar, like:
        <br />
        <br />
        <a
          className="bg-white/10 p-2 hover:bg-white/20 transition-colors"
          href="
            https://shovel.report/vercel.com
        "
        >
          shovel.report/vercel.com
        </a>
      </div>
    </div>
  );
}
