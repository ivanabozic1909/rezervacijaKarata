import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Rezervacija karata",
  description: "Aplikacija za rezervaciju karata za koncerte",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        {children}
        <footer className="bg-gray-900 text-white text-center py-6 mt-20">
          © {new Date().getFullYear()} Rezervacija karata
        </footer>
      </body>
    </html>
  );
}