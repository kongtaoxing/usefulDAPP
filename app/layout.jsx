import "./globals.css";

export const metadata = {
  title: "KTX工具箱",
  description: "",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  );
}
