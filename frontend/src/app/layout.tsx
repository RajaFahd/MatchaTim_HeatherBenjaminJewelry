import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "../components/ClientWrapper";

export const metadata: Metadata = {
  title: "Heather Benjamin Jewelry - PO Assistant",
  description: "A premium AI assistant to extract and process purchase orders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased transition-colors duration-300">
      <body className="min-h-full flex flex-col bg-bg-main text-txt-main transition-colors duration-300">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
