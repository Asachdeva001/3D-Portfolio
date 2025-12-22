// Portfolio data for the cyberpunk 3D portfolio

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link: string;
  image?: string;
  featured?: boolean;
}

export interface Skill {
  name: string;
  level: number;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  experience: number;
  location?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface ContactInfo {
  email: string;
  location: string;
  social: SocialLink[];
}

export interface PortfolioData {
  personal: PersonalInfo;
  projects: Project[];
  skills: SkillCategory[];
  contact: ContactInfo;
}

export const portfolioData: PortfolioData = {
  personal: {
    name: 'Aashish Sachdeva',
    title: 'Full Stack Developer & 3D Graphics Enthusiast',
    bio: 'Passionate developer with expertise in modern web technologies, 3D graphics, and creating immersive digital experiences. I specialize in React, TypeScript, Three.js, and building scalable web applications.',
    experience: 5,
    location: 'San Francisco, CA'
  },
  
  projects: [
    {
      title: 'Cyberpunk Portfolio',
      description: 'An immersive 3D portfolio built with Next.js, Three.js, and React Three Fiber. Features a fully interactive cyberpunk city with holographic displays.',
      technologies: ['Next.js', 'Three.js', 'TypeScript', 'React Three Fiber', 'Tailwind CSS'],
      link: 'https://github.com/yourusername/cyberpunk-portfolio',
      featured: true
    },
    {
      title: 'Real-time Chat Application',
      description: 'A modern chat application with real-time messaging, file sharing, and video calls. Built with WebRTC and Socket.io.',
      technologies: ['React', 'Node.js', 'Socket.io', 'WebRTC', 'MongoDB'],
      link: 'https://github.com/yourusername/chat-app',
      featured: true
    },
    {
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with payment processing, inventory management, and admin dashboard.',
      technologies: ['Next.js', 'PostgreSQL', 'Stripe', 'Prisma', 'Tailwind CSS'],
      link: 'https://github.com/yourusername/ecommerce-platform',
      featured: true
    },
    {
      title: 'Data Visualization Dashboard',
      description: 'Interactive dashboard for visualizing complex datasets with charts, graphs, and real-time updates.',
      technologies: ['React', 'D3.js', 'Python', 'FastAPI', 'PostgreSQL'],
      link: 'https://github.com/yourusername/data-dashboard',
      featured: false
    },
    {
      title: 'Mobile Game Engine',
      description: 'Cross-platform 2D game engine built with TypeScript and WebGL for creating mobile games.',
      technologies: ['TypeScript', 'WebGL', 'Canvas API', 'Webpack', 'Jest'],
      link: 'https://github.com/yourusername/game-engine',
      featured: false
    },
    {
      title: 'AI-Powered Code Assistant',
      description: 'VS Code extension that provides intelligent code suggestions and refactoring using machine learning.',
      technologies: ['TypeScript', 'VS Code API', 'Python', 'TensorFlow', 'OpenAI API'],
      link: 'https://github.com/yourusername/code-assistant',
      featured: false
    }
  ],
  
  skills: [
    {
      category: 'Frontend Development',
      skills: [
        { name: 'React/Next.js', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'Three.js/WebGL', level: 85 },
        { name: 'CSS/Tailwind', level: 90 },
        { name: 'Vue.js', level: 75 },
        { name: 'Angular', level: 70 }
      ]
    },
    {
      category: 'Backend Development',
      skills: [
        { name: 'Node.js', level: 88 },
        { name: 'Python', level: 85 },
        { name: 'PostgreSQL', level: 80 },
        { name: 'GraphQL', level: 75 },
        { name: 'MongoDB', level: 82 },
        { name: 'Redis', level: 70 }
      ]
    },
    {
      category: 'Tools & Technologies',
      skills: [
        { name: 'Git/GitHub', level: 95 },
        { name: 'Docker', level: 80 },
        { name: 'AWS/Cloud', level: 75 },
        { name: 'CI/CD', level: 70 },
        { name: 'Kubernetes', level: 65 },
        { name: 'Terraform', level: 60 }
      ]
    },
    {
      category: '3D Graphics & Game Dev',
      skills: [
        { name: 'Three.js', level: 85 },
        { name: 'WebGL', level: 80 },
        { name: 'Blender', level: 70 },
        { name: 'Unity', level: 65 },
        { name: 'Shader Programming', level: 75 }
      ]
    }
  ],
  
  contact: {
    email: 'aashish@example.com',
    location: 'San Francisco, CA',
    social: [
      {
        name: 'GitHub',
        url: 'https://github.com/yourusername',
        icon: 'github'
      },
      {
        name: 'LinkedIn',
        url: 'https://linkedin.com/in/yourusername',
        icon: 'linkedin'
      },
      {
        name: 'Twitter',
        url: 'https://twitter.com/yourusername',
        icon: 'twitter'
      },
      {
        name: 'Portfolio',
        url: 'https://yourportfolio.com',
        icon: 'globe'
      }
    ]
  }
};

export default portfolioData;