import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aashish Sachdeva - Cyberpunk Portfolio 2077",
  description: "An immersive 3D cyberpunk-themed portfolio showcasing full-stack development skills in a futuristic city environment. Experience cutting-edge web technologies with Three.js, WebGL, and React.",
  keywords: [
    "3D Portfolio",
    "Cyberpunk",
    "WebGL",
    "Three.js",
    "Full Stack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Interactive Portfolio",
    "Aashish Sachdeva",
    "Web Development",
    "Frontend Developer",
    "Backend Developer",
    "JavaScript",
    "Node.js"
  ],
  authors: [{ name: "Aashish Sachdeva" }],
  creator: "Aashish Sachdeva",
  publisher: "Aashish Sachdeva",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aashish-sachdeva.vercel.app/',
    siteName: 'Aashish Sachdeva - Cyberpunk Portfolio',
    title: 'Aashish Sachdeva - Cyberpunk Portfolio 2077',
    description: 'Immersive 3D cyberpunk portfolio showcasing full-stack development skills, Three.js expertise, and cutting-edge web technologies.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Aashish Sachdeva Cyberpunk Portfolio - 3D Interactive Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aashish Sachdeva - Cyberpunk Portfolio 2077',
    description: 'Experience the future of web development with this immersive 3D cyberpunk portfolio.',
    images: ['/twitter-image.jpg'],
    creator: '@aashishsachdeva',
  },
  metadataBase: new URL('https://aashish-portfolio.vercel.app'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: 'https://aashish-portfolio.vercel.app',
  },
  category: 'technology',
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00ffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a1a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Aashish Sachdeva",
              "jobTitle": "Full Stack Developer",
              "description": "Experienced full-stack developer specializing in modern web technologies, 3D graphics, and immersive digital experiences.",
              "url": "https://aashish-portfolio.vercel.app",
              "sameAs": [
                "https://github.com/aashishsachdeva",
                "https://linkedin.com/in/aashishsachdeva",
                "https://twitter.com/aashishsachdeva"
              ],
              "knowsAbout": [
                "JavaScript",
                "TypeScript",
                "React",
                "Next.js",
                "Three.js",
                "WebGL",
                "Node.js",
                "Python",
                "Full Stack Development",
                "3D Graphics Programming"
              ],
              "worksFor": {
                "@type": "Organization",
                "name": "Freelance Developer"
              }
            })
          }}
        />
        
        {/* WebGL and 3D specific meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cyberpunk Portfolio" />
        
        {/* Performance hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-hidden`}
      >
        {/* Fallback content for search engines and accessibility */}
        <noscript>
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#0a0a1a',
            color: '#00ffff',
            fontFamily: 'monospace'
          }}>
            <h1>Aashish Sachdeva - Cyberpunk Portfolio</h1>
            <p>This interactive 3D portfolio requires JavaScript to be enabled.</p>
            <p>I&apos;m a full-stack developer specializing in modern web technologies, 3D graphics, and immersive digital experiences.</p>
            <div style={{ marginTop: '2rem' }}>
              <h2>Skills</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>• React & Next.js Development</li>
                <li>• Three.js & WebGL Programming</li>
                <li>• TypeScript & JavaScript</li>
                <li>• Node.js & Python Backend</li>
                <li>• Database Design & Management</li>
                <li>• Cloud Infrastructure & DevOps</li>
              </ul>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <h2>Contact</h2>
              <p>Email: aashish@example.com</p>
              <p>GitHub: github.com/aashishsachdeva</p>
              <p>LinkedIn: linkedin.com/in/aashishsachdeva</p>
            </div>
          </div>
        </noscript>
        
        {children}
        
        {/* Analytics and tracking scripts would go here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
