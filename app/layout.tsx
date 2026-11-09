
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MAPIFY | NFC & QR Review Card",
  description:
    "Activate your MAPIFY NFC and QR Review Card.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
