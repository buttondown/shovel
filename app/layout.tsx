import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics />
      <body>
        <div className="font-mono bg-gray-900 min-h-screen text-white p-8 flex flex-col">
          <div className="font-black">
            <a href="/">
              <header className="bg-blue-500 inline-block px-2 py-1 fixed top-0 left-0">
                shovel.report
              </header>
            </a>
          </div>
          <div className="flex-1 py-8">{children}</div>
          <div className="text-xs text-gray-400 pt-16">
            © {new Date().getFullYear()}. I hope you have a nice day.
          </div>
        </div>
      </body>
    </html>
  );
}
