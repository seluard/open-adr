// app/layout.tsx
import "./globals.css";
import Providers from "@/components/Providers";
import type { Metadata } from "next";

// Site-wide metadata & favicon reference. Drop a real /favicon.ico to override.
export const metadata: Metadata = {
	title: "Open-ADR",
	description: "Discover, browse & (soon) manage Architecture Decision Records across your GitHub repositories.",
	icons: {
		icon: "/favicon.ico"
	}
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen">
				<Providers>
					<main className="p-4">{children}</main>
				</Providers>
			</body>
		</html>
	);
}
