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
    <div className="font-mono bg-gray-900 min-h-screen text-white p-8">
        <div className="font-black">
          <header className="rotate-[-3deg] bg-blue-500 inline-block px-2 py-1">
            shovel.report
          </header>
        </div>
        {children}
        </div>
      </body>
    </html>
  );
}
