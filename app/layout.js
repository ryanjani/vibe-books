import { Geist, Geist_Mono } from "next/font/google";
import { Merriweather } from "next/font/google"; // ✅ Add Merriweather
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const merriweather = Merriweather({ // ✅ Configure Merriweather
  variable: "--font-merriweather",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Show me something",
  description: "Made by ryanjani",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${merriweather.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}