import "./globals.css";

export const metadata = {
  title: "ShopyBucks Admin",
  description: "ShopyBucks Admin Management Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-amazon-lightGray text-amazon-text antialiased">
        {children}
      </body>
    </html>
  );
}
