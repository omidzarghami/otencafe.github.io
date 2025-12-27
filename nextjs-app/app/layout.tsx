import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const iranRounded = localFont({
  src: "../public/assets/font/IRAN-Rounded.woff",
  variable: "--font-iran-rounded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://otencafe.ir"),
  title: "منوی کافه اوتن",
  description:
    "لذت طعم‌های منحصر به فرد را در کافه اوتن تجربه کنید. از قهوه‌های اسپرسو گرفته تا دسرهای خانگی، منوی متنوع ما برای هر سلیقه‌ای گزینه‌ای دارد.",
  keywords: ["کافه", "قهوه", "منو", "کافه اوتن", "اسپرسو"],
  icons: {
    icon: [
      { url: "/assets/images/oten-cafe-logo.jpg", type: "image/jpeg" },
      { url: "/assets/images/otenlogo.webp", type: "image/webp" },
    ],
    apple: [
      { url: "/assets/images/oten-cafe-logo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/assets/images/oten-cafe-logo.jpg",
  },
  openGraph: {
    title: "منوی کافه اوتن",
    description:
      "لذت طعم‌های منحصر به فرد را در کافه اوتن تجربه کنید. از قهوه‌های دست‌ساز گرفته تا دسرهای خانگی، منوی متنوع ما برای هر سلیقه‌ای گزینه‌ای دارد.",
    images: ["/assets/images/otenlogo.webp"],
    url: "https://otencafe.ir",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "منوی کافه اوتن",
    description:
      "لذت طعم‌های منحصر به فرد را در کافه اوتن تجربه کنید. از قهوه‌های دست‌ساز گرفته تا دسرهای خانگی، منوی متنوع ما برای هر سلیقه‌ای گزینه‌ای دارد.",
    images: ["/assets/images/otenlogo.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${iranRounded.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
