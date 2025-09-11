// app/layout.tsx
import "./globals.css";
import Providers from "@/components/Providers";

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
