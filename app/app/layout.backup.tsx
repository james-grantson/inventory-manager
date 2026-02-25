import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SimpleAuthStatus from "@/components/SimpleAuthStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory Manager - Ghana",
  description: "Professional inventory management system for Ghanaian businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Simple header with auth */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Inventory Manager</h1>
                <p className="text-xs text-gray-600">Ghana Business Edition</p>
              </div>
              <SimpleAuthStatus />
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main>{children}</main>
        
        {/* Simple footer */}
        <footer className="mt-8 border-t bg-gray-50 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            <p> {new Date().getFullYear()} Inventory Manager. Built for Ghanaian businesses.</p>
            <p className="mt-1 text-xs">Backend: inventory-manager-api-ghana.vercel.app</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
