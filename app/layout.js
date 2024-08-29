import "./globals.css";

export const metadata = {
  title: "Draw Something Next.js",
  description: "A simple drawing app built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
