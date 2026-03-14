import "./globals.css";

export const metadata = {
  title: "Climbing Terms + Experience Map",
  description: "A Notion-backed climbing terms reference built with Next.js.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
