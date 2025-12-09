export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl: string;
  hologramPosition: [number, number, number];
  neonColor: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: 'ai-workspace',
    title: 'AI-Workspace',
    description: 'A collaborative platform for teams to create, edit, and share documents with AI assistance.',
    image: '/projects/ai-workspace.jpg',
    technologies: ['Next.js', 'React', 'MongoDB', 'Node.js', 'Express.js'],
    githubUrl: 'https://github.com/Ashisach001/AiWorkspace-client',
    hologramPosition: [15, 8, -25],
    neonColor: '#00ffff',
    featured: true
  },
  {
    id: 'noteflow',
    title: 'Noteflow',
    description: 'A modern note and task management app with real-time collaboration features.',
    image: '/projects/noteflow.jpg',
    technologies: ['React.js', 'Firebase', 'Material-UI'],
    githubUrl: 'https://github.com/Ashisach001/Noteflow',
    hologramPosition: [-20, 6, -15],
    neonColor: '#ff0080',
    featured: true
  },
  {
    id: 'newsdiary',
    title: 'NewsDiary',
    description: 'A personalized news aggregation app with AI-powered content curation.',
    image: '/projects/newsdiary.jpg',
    technologies: ['React', 'Tailwind CSS', 'News API'],
    githubUrl: 'https://github.com/Ashisach001/News-Diary',
    hologramPosition: [25, 7, -10],
    neonColor: '#ff8000',
    featured: false
  },
  {
    id: 'textutils',
    title: 'TextUtils',
    description: 'A comprehensive text analysis and manipulation tool with multiple utilities.',
    image: '/projects/textutils.jpg',
    technologies: ['React', 'CSS', 'JavaScript'],
    githubUrl: 'https://github.com/Ashisach001/TextUtils',
    hologramPosition: [-15, 5, -30],
    neonColor: '#8000ff',
    featured: false
  },
  {
    id: 'cyberpunk-portfolio',
    title: 'Cyberpunk 3D Portfolio',
    description: 'An immersive 3D cyberpunk-themed portfolio with interactive elements and WebGL effects.',
    image: '/projects/cyberpunk-portfolio.jpg',
    technologies: ['Next.js', 'Three.js', 'React Three Fiber', 'WebGL', 'GLSL'],
    githubUrl: 'https://github.com/Ashisach001/cyberpunk-portfolio',
    hologramPosition: [0, 10, -20],
    neonColor: '#00ff80',
    featured: true
  }
];

export default projects;