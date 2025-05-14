import React from "react";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

import { Inter } from "next/font/google";
import "./globals.css";

import "@maptiler/sdk/dist/maptiler-sdk.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QuantumCoupon AI",
  description: "An AI-powered tool for QuantumCoupon AI sales outreach automation.",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quantum-coupon-ai.vercel.app",
    title: "QuantumCoupon AI",
    description: "An AI-powered tool for QuantumCoupon AI sales outreach automation.",
    images: [
      {
        url: "https://res.cloudinary.com/dlfqo15qy/image/upload/v1704254164/quantum-coupon/AI-powered_Sales_Outreach_uprwbo.png",
        width: 1200,
        height: 630,
        alt: "QuantumCoupon AI Logo",
      },
    ],
    site_name: "QuantumCoupon AI",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" translate="no">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
