'use client';

import { useEffect, useCallback } from 'react';
import Head from 'next/head';

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

interface SEOOptimizerProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: StructuredData;
}

export default function SEOOptimizer({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage,
  structuredData
}: SEOOptimizerProps) {
  
  useEffect(() => {
    // Dynamic SEO optimizations
    
    // Add performance monitoring
    if (typeof window !== 'undefined') {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            console.log('FID:', fidEntry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!clsEntry.hadRecentInput) {
              console.log('CLS:', clsEntry.value);
            }
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch {
        // Browser doesn't support all entry types
      }
      
      return () => observer.disconnect();
    }
  }, []);
  
  return (
    <>
      {title && (
        <Head>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta name="twitter:title" content={title} />
        </Head>
      )}
      
      {description && (
        <Head>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
        </Head>
      )}
      
      {keywords.length > 0 && (
        <Head>
          <meta name="keywords" content={keywords.join(', ')} />
        </Head>
      )}
      
      {canonicalUrl && (
        <Head>
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:url" content={canonicalUrl} />
        </Head>
      )}
      
      {ogImage && (
        <Head>
          <meta property="og:image" content={ogImage} />
          <meta name="twitter:image" content={ogImage} />
        </Head>
      )}
      
      {structuredData && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData)
            }}
          />
        </Head>
      )}
    </>
  );
}

interface AnalyticsParameters {
  [key: string]: string | number | boolean;
}

// Hook for tracking page views and user interactions
export function useAnalytics() {
  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined') {
      const windowWithGtag = window as Window & { gtag?: Function };
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    }
  }, []);
  
  const trackEvent = useCallback((eventName: string, parameters: AnalyticsParameters = {}) => {
    if (typeof window !== 'undefined') {
      const windowWithGtag = window as Window & { gtag?: Function };
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag('event', eventName, parameters);
      }
    }
  }, []);
  
  const trackInteraction = useCallback((element: string, action: string) => {
    trackEvent('interaction', {
      element_type: element,
      action: action,
      timestamp: Date.now()
    });
  }, [trackEvent]);
  
  const track3DPerformance = useCallback((fps: number, quality: string) => {
    trackEvent('3d_performance', {
      fps: Math.round(fps),
      quality_setting: quality,
      timestamp: Date.now()
    });
  }, [trackEvent]);
  
  return {
    trackEvent,
    trackInteraction,
    track3DPerformance
  };
}

// Component for tracking 3D portfolio interactions
export function PortfolioAnalytics() {
  const { trackInteraction, trackEvent } = useAnalytics();
  
  useEffect(() => {
    // Track when 3D scene loads
    trackInteraction('3d_scene', 'loaded');
    
    // Track device capabilities
    const deviceInfo = {
      userAgent: navigator.userAgent,
      webgl_support: !!document.createElement('canvas').getContext('webgl'),
      webgl2_support: !!document.createElement('canvas').getContext('webgl2'),
      screen_resolution: `${screen.width}x${screen.height}`,
      pixel_ratio: window.devicePixelRatio
    };
    
    trackEvent('device_capabilities', deviceInfo);
  }, [trackInteraction, trackEvent]);
  
  return null;
}

// SEO-friendly fallback content component
export function SEOFallback() {
  return (
    <div style={{ display: 'none' }} aria-hidden="true">
      {/* Hidden content for search engines */}
      <h1>Aashish Sachdeva - Full Stack Developer</h1>
      <h2>Interactive 3D Cyberpunk Portfolio</h2>
      
      <section>
        <h3>About</h3>
        <p>
          Experienced full-stack developer specializing in modern web technologies, 
          3D graphics programming, and immersive digital experiences. Proficient in 
          React, Next.js, Three.js, WebGL, Node.js, and Python.
        </p>
      </section>
      
      <section>
        <h3>Skills</h3>
        <ul>
          <li>Frontend Development: React, Next.js, TypeScript, Three.js, WebGL</li>
          <li>Backend Development: Node.js, Python, Express, FastAPI</li>
          <li>Database Technologies: PostgreSQL, MongoDB, Redis</li>
          <li>Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD</li>
          <li>3D Graphics: Three.js, WebGL, Blender, 3D Modeling</li>
        </ul>
      </section>
      
      <section>
        <h3>Featured Projects</h3>
        <article>
          <h4>3D Interactive Portfolio</h4>
          <p>Immersive cyberpunk-themed portfolio built with Three.js and React</p>
        </article>
        <article>
          <h4>E-commerce Platform</h4>
          <p>Full-stack e-commerce solution with React frontend and Node.js backend</p>
        </article>
        <article>
          <h4>Real-time Chat Application</h4>
          <p>WebSocket-based chat application with real-time messaging</p>
        </article>
      </section>
      
      <section>
        <h3>Contact Information</h3>
        <address>
          <p>Email: aashish@example.com</p>
          <p>GitHub: github.com/aashishsachdeva</p>
          <p>LinkedIn: linkedin.com/in/aashishsachdeva</p>
          <p>Location: Available for remote work worldwide</p>
        </address>
      </section>
    </div>
  );
}