'use client';

import { useMemo } from 'react';
import HologramBillboard from './HologramBillboard';
import { portfolioData } from '@/data/portfolioData';
import { random } from '@/utils/mathUtils';

export default function PortfolioScene() {
  // Generate billboard positions and content
  const billboards = useMemo(() => {
    const positions = [
      // Project billboards - arranged in a semi-circle
      { pos: [15, 8, 10], type: 'project', index: 0, color: '#ff0080' },
      { pos: [-15, 6, 12], type: 'project', index: 1, color: '#00ffff' },
      { pos: [20, 10, -8], type: 'project', index: 2, color: '#ff8000' },
      { pos: [-12, 7, -15], type: 'project', index: 3, color: '#8000ff' },
      
      // Skills billboards - positioned around the city
      { pos: [8, 12, 25], type: 'skill', index: 0, color: '#00ff80' },
      { pos: [-25, 9, 5], type: 'skill', index: 1, color: '#ff0080' },
      { pos: [12, 15, -20], type: 'skill', index: 2, color: '#00ffff' },
      
      // About billboard - central and prominent
      { pos: [0, 12, 30], type: 'about', index: 0, color: '#ff8000' },
      
      // Contact billboard - easily accessible
      { pos: [-8, 6, 18], type: 'contact', index: 0, color: '#8000ff' }
    ];
    
    return positions.map(({ pos, type, index, color }) => {
      let content;
      
      switch (type) {
        case 'project':
          content = {
            type: 'project' as const,
            data: portfolioData.projects[index] || {
              title: 'Sample Project',
              description: 'A showcase project demonstrating various technologies and skills.',
              technologies: ['React', 'TypeScript', 'Three.js'],
              link: '#'
            }
          };
          break;
          
        case 'skill':
          const skillCategories = [
            {
              category: 'Frontend Development',
              skills: [
                { name: 'React/Next.js', level: 95 },
                { name: 'TypeScript', level: 90 },
                { name: 'Three.js/WebGL', level: 85 },
                { name: 'CSS/Tailwind', level: 90 }
              ]
            },
            {
              category: 'Backend Development',
              skills: [
                { name: 'Node.js', level: 88 },
                { name: 'Python', level: 85 },
                { name: 'PostgreSQL', level: 80 },
                { name: 'GraphQL', level: 75 }
              ]
            },
            {
              category: 'Tools & Technologies',
              skills: [
                { name: 'Git/GitHub', level: 95 },
                { name: 'Docker', level: 80 },
                { name: 'AWS/Cloud', level: 75 },
                { name: 'CI/CD', level: 70 }
              ]
            }
          ];
          
          content = {
            type: 'skill' as const,
            data: skillCategories[index] || skillCategories[0]
          };
          break;
          
        case 'about':
          content = {
            type: 'about' as const,
            data: portfolioData.personal || {
              name: 'Your Name',
              title: 'Full Stack Developer',
              bio: 'Passionate developer with expertise in modern web technologies, 3D graphics, and creating immersive digital experiences.',
              experience: 5
            }
          };
          break;
          
        case 'contact':
          content = {
            type: 'contact' as const,
            data: portfolioData.contact || {
              email: 'your.email@example.com',
              location: 'Your City, Country',
              social: [
                { name: 'GitHub', url: 'https://github.com/yourusername' },
                { name: 'LinkedIn', url: 'https://linkedin.com/in/yourusername' },
                { name: 'Twitter', url: 'https://twitter.com/yourusername' }
              ]
            }
          };
          break;
          
        default:
          content = {
            type: 'project' as const,
            data: { title: 'Default', description: 'Default content', technologies: [], link: '#' }
          };
      }
      
      return {
        position: pos as [number, number, number],
        content,
        color,
        size: type === 'about' ? [5, 4] as [number, number] : [4, 3] as [number, number]
      };
    });
  }, []);
  
  return (
    <>
      {billboards.map((billboard, index) => (
        <HologramBillboard
          key={index}
          position={billboard.position}
          content={billboard.content}
          size={billboard.size}
          color={billboard.color}
        />
      ))}
      
      {/* Additional atmospheric elements */}
      {/* Floating data streams */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={`stream-${i}`} position={[
          random.range(-40, 40),
          random.range(5, 20),
          random.range(-40, 40)
        ]}>
          <mesh>
            <boxGeometry args={[0.1, 8, 0.1]} />
            <meshBasicMaterial
              color={random.choice(['#ff0080', '#00ffff', '#ff8000', '#8000ff'])}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      ))}
      
      {/* Information nodes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`node-${i}`} position={[
          random.range(-30, 30),
          random.range(3, 15),
          random.range(-30, 30)
        ]}>
          <mesh>
            <sphereGeometry args={[0.3]} />
            <meshBasicMaterial
              color={random.choice(['#ff0080', '#00ffff', '#ff8000'])}
              transparent
              opacity={0.8}
            />
          </mesh>
          <pointLight
            intensity={0.3}
            color={random.choice(['#ff0080', '#00ffff', '#ff8000'])}
            distance={8}
            decay={2}
          />
        </group>
      ))}
    </>
  );
}