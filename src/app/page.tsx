'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/loading/LoadingSystem';
import ResponsiveWrapper from '@/components/responsive/ResponsiveWrapper';
import LoadingScreen from '@/components/loading/LoadingSystem';
import { SEOFallback } from '@/components/seo/SEOOptimizer';

// Dynamically import 3D components to avoid SSR issues
const Scene = dynamic(() => import('@/components/3d/Scene'), { ssr: false });
const Ground = dynamic(() => import('@/components/3d/Ground'), { ssr: false });
const Buildings = dynamic(() => import('@/components/3d/Buildings'), { ssr: false });
const Lighting = dynamic(() => import('@/components/3d/Lighting'), { ssr: false });
const HoverCars = dynamic(() => import('@/components/3d/HoverCars'), { ssr: false });
const PortfolioScene = dynamic(() => import('@/components/3d/PortfolioScene'), { ssr: false });
const PlayerController = dynamic(() => import('@/components/3d/PlayerController'), { ssr: false });
const CameraController = dynamic(() => import('@/components/3d/CameraController'), { ssr: false });
const CollisionSystem = dynamic(() => import('@/components/3d/CollisionSystem'), { ssr: false });
const Effects = dynamic(() => import('@/components/3d/Effects'), { ssr: false });
const HUD = dynamic(() => import('@/components/ui/HUD'), { ssr: false });
const MobileControls = dynamic(() => import('@/components/ui/MobileControls'), { ssr: false });
const ParticleSystem = dynamic(() => import('@/components/effects/ParticleSystem'), { ssr: false });

// 3D Portfolio Component
function CyberpunkPortfolio() {
  return (
    <div className="w-full h-screen relative">
      {/* 3D Scene */}
      <Scene enablePhysics={true} enablePostProcessing={true}>
        {/* Lighting */}
        <Lighting />
        
        {/* Environment */}
        <Ground size={200} reflectionIntensity={0.4} />
        
        {/* Buildings */}
        <Buildings />
        
        {/* Interactive Content */}
        <PortfolioScene />
        
        {/* Animated Elements */}
        <HoverCars />
        
        {/* Player and Controls */}
        <PlayerController position={[0, 2, 0]} />
        <CameraController />
        
        {/* Physics and Collision */}
        <CollisionSystem />
        
        {/* Visual Effects */}
        <Effects enablePostProcessing={true} />
        
        {/* Particle Effects */}
        <Suspense fallback={null}>
          <ParticleSystem count={50} color="#00ffff" type="glow" />
        </Suspense>
      </Scene>
      
      {/* UI Overlays */}
      <HUD showDebugInfo={false} showControls={true} />
      
      {/* Mobile Controls */}
      <MobileControls
        onMove={(direction) => {
          // Handle mobile movement
        }}
        onLook={(delta) => {
          // Handle mobile look
        }}
        onJump={() => {
          // Handle mobile jump
        }}
        onRun={(isRunning) => {
          // Handle mobile run
        }}
      />
    </div>
  );
}

// Fallback 2D Portfolio
function Fallback2DPortfolio() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Aashish Sachdeva
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Full Stack Developer & 3D Graphics Enthusiast
          </p>
          <div className="bg-yellow-900/20 border border-yellow-400 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-400 text-sm">
              Your device doesn&apos;t support the full 3D experience. Here&apos;s the optimized version.
            </p>
          </div>
        </div>
        
        {/* Skills Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-cyan-400">Skills</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Frontend Development',
                skills: ['React/Next.js', 'TypeScript', 'Three.js/WebGL', 'Tailwind CSS']
              },
              {
                title: 'Backend Development',
                skills: ['Node.js', 'Python', 'PostgreSQL', 'GraphQL']
              },
              {
                title: 'Tools & Technologies',
                skills: ['Git/GitHub', 'Docker', 'AWS/Cloud', 'CI/CD']
              }
            ].map((category, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-orange-400 mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="text-gray-300 flex items-center">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        
        {/* Contact Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-purple-400">Get In Touch</h2>
          <div className="max-w-md mx-auto">
            <p className="text-gray-300 mb-6">
              Interested in working together? Let&apos;s connect!
            </p>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <p className="text-cyan-400">aashish@example.com</p>
              </div>
              <div className="flex justify-center space-x-4">
                {['GitHub', 'LinkedIn', 'Twitter'].map((platform, index) => (
                  <button key={index} className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded hover:border-cyan-400 hover:text-cyan-400 transition-colors">
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* SEO Fallback Content */}
      <SEOFallback />
      
      {/* Main Application */}
      <ErrorBoundary>
        <ResponsiveWrapper fallbackComponent={<Fallback2DPortfolio />}>
          <Suspense fallback={<LoadingScreen />}>
            <CyberpunkPortfolio />
          </Suspense>
        </ResponsiveWrapper>
      </ErrorBoundary>
    </>
  );
}