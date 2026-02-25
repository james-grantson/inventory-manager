import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthStatus from "@/components/AuthStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory Manager",
  description: "Professional inventory management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800"> Inventory Manager</h1>
                <p className="text-gray-600 text-sm">Manage products, track stock, generate reports</p>
              </div>
              <AuthStatus />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white py-6">
          <div className="container mx-auto px-4">
            <div className="text-center text-gray-600 text-sm">
              <p>© {new Date().getFullYear()} Inventory Manager. All rights reserved.</p>
              <div className="mt-2 text-xs">
                <span className="px-2">Backend: inventory-manager-api-ghana.vercel.app</span>
                <span className="px-2">•</span>
                <span className="px-2">Supabase Connected</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
