export interface PersonalInfo {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  avatar?: string;
  hologramPosition: [number, number, number];
}

export const personalInfo: PersonalInfo = {
  name: 'Aashish Sachdeva',
  title: 'Full Stack Developer',
  tagline: 'Creating the future with code in a cyberpunk world',
  bio: `I'm a passionate Computer Science student at Punjab Engineering College, 
        specializing in full-stack web development with a focus on cutting-edge 
        technologies. I love building immersive digital experiences that push 
        the boundaries of what's possible on the web.`,
  location: 'Chandigarh, India',
  email: 'ashisach001@gmail.com',
  avatar: '/avatar.jpg',
  hologramPosition: [0, 6, -35]
};

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  neonColor: string;
}

export const socialLinks: SocialLink[] = [
  {
    platform: 'GitHub',
    url: 'https://github.com/Asachdeva001',
    icon: 'github',
    neonColor: '#00ffff'
  },
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/aashish-sachdeva-6b1943281/',
    icon: 'linkedin',
    neonColor: '#0080ff'
  },
  {
    platform: 'Email',
    url: 'mailto:ashisach001@gmail.com',
    icon: 'email',
    neonColor: '#ff0080'
  }
];

export default personalInfo;