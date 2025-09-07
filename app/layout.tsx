// app/layout.tsx
import "./globals.css";
import Providers from "@/components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-white text-black dark:bg-black dark:text-white"
        style={{ background: undefined, color: undefined }}
      >
        <Providers>
          <main className="p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
