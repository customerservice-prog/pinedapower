import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Digital Life",
  description: "Everything that matters, in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
