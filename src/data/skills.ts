export interface Skill {
  name: string;
  icon: string;
  proficiency: number;
  description: string;
  projects: string[];
  neonColor: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: Skill[];
  hologramPosition: [number, number, number];
  primaryColor: string;
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    hologramPosition: [30, 8, -20],
    primaryColor: '#00ffff',
    skills: [
      {
        name: 'React',
        icon: '⚛️',
        proficiency: 90,
        description: 'Advanced React development with hooks, context, and modern patterns',
        projects: ['AI-Workspace', 'Noteflow', 'NewsDiary'],
        neonColor: '#00ffff'
      },
      {
        name: 'Next.js',
        icon: '▲',
        proficiency: 85,
        description: 'Full-stack Next.js applications with SSR, API routes, and optimization',
        projects: ['Portfolio', 'AI-Workspace'],
        neonColor: '#ffffff'
      },
      {
        name: 'Three.js',
        icon: '🎮',
        proficiency: 80,
        description: '3D web development with WebGL, shaders, and interactive experiences',
        projects: ['Cyberpunk Portfolio', '3D Visualizations'],
        neonColor: '#ff8000'
      },
      {
        name: 'TypeScript',
        icon: '📘',
        proficiency: 85,
        description: 'Type-safe development with advanced TypeScript features',
        projects: ['Enterprise Apps', 'API Development'],
        neonColor: '#0080ff'
      }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Development',
    hologramPosition: [-30, 7, -25],
    primaryColor: '#ff0080',
    skills: [
      {
        name: 'Node.js',
        icon: '🟢',
        proficiency: 85,
        description: 'Scalable server-side applications and RESTful APIs',
        projects: ['AI-Workspace API', 'Authentication Services'],
        neonColor: '#00ff80'
      },
      {
        name: 'Express.js',
        icon: '🚂',
        proficiency: 85,
        description: 'Web application framework with middleware and routing',
        projects: ['REST APIs', 'Web Services'],
        neonColor: '#ffff00'
      },
      {
        name: 'MongoDB',
        icon: '🍃',
        proficiency: 80,
        description: 'NoSQL database design, aggregation, and optimization',
        projects: ['AI-Workspace', 'Data Analytics'],
        neonColor: '#00ff40'
      },
      {
        name: 'PostgreSQL',
        icon: '🐘',
        proficiency: 75,
        description: 'Relational database design and complex queries',
        projects: ['Enterprise Systems', 'Data Management'],
        neonColor: '#4080ff'
      }
    ]
  },
  {
    id: 'tools',
    title: 'Tools & Technologies',
    hologramPosition: [0, 9, -45],
    primaryColor: '#8000ff',
    skills: [
      {
        name: 'Git & GitHub',
        icon: '🐙',
        proficiency: 90,
        description: 'Version control, collaboration, and CI/CD workflows',
        projects: ['All Projects', 'Open Source'],
        neonColor: '#ff4080'
      },
      {
        name: 'Docker',
        icon: '🐳',
        proficiency: 70,
        description: 'Containerization and deployment automation',
        projects: ['Microservices', 'DevOps'],
        neonColor: '#0080ff'
      },
      {
        name: 'AWS',
        icon: '☁️',
        proficiency: 65,
        description: 'Cloud infrastructure and serverless applications',
        projects: ['Cloud Deployments', 'Scalable Apps'],
        neonColor: '#ff8040'
      },
      {
        name: 'WebGL/GLSL',
        icon: '🎨',
        proficiency: 75,
        description: 'Custom shaders and advanced 3D graphics programming',
        projects: ['3D Portfolio', 'Visual Effects'],
        neonColor: '#ff0080'
      }
    ]
  }
];

export default skillCategories;