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
                <body
                          style={{
                                      margin: 0,
                                      minHeight: "100vh",
                                      background: "#0b0b0f",
                                      color: "#f5f5f7",
                                      fontFamily:
                                                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                          }}
                        >
                  {children}
                </body>
          </html>
        );
}
