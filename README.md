# 🌆 Cyberpunk 3D Portfolio

An immersive 3D cyberpunk-themed portfolio built with Next.js, Three.js, and React Three Fiber. Experience a futuristic city environment with interactive holographic billboards showcasing projects, skills, and contact information.

![Cyberpunk Portfolio](./public/og-image.jpg)

## ✨ Features

- **🎮 Interactive 3D Environment**: Navigate through a cyberpunk city with WASD controls
- **🏢 Procedural Buildings**: Dynamically generated neon-lit skyscrapers
- **🚗 Animated Hover Cars**: Flying vehicles with light trails and particle effects
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🎯 Performance Optimized**: Automatic quality adjustment based on device capabilities
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **🔊 Audio System**: Immersive cyberpunk soundscape (optional)
- **📊 Analytics**: Performance monitoring and user interaction tracking

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Physics**: Rapier Physics Engine
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Performance**: Web Workers, LOD System, Frustum Culling
- **Deployment**: Vercel

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aashishsachdeva/cyberpunk-portfolio.git
   cd cyberpunk-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Controls

### Desktop
- **WASD**: Move around the city
- **Mouse**: Look around (click to enable pointer lock)
- **Shift**: Run/Sprint
- **Space**: Jump
- **C**: Toggle camera mode (first-person/third-person)
- **ESC**: Exit pointer lock mode

### Mobile
- **Left Joystick**: Movement
- **Right Touchpad**: Look around
- **Jump Button**: Jump
- **Run Button**: Toggle run mode

## 🏗️ Project Structure

```
cyberpunk-portfolio/
├── src/
│   ├── app/                    # Next.js app directory
│   ├── components/
│   │   ├── 3d/                # Three.js components
│   │   ├── ui/                # UI components
│   │   ├── effects/           # Visual effects
│   │   ├── audio/             # Audio system
│   │   └── optimization/      # Performance optimization
│   ├── data/                  # Portfolio data and configuration
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # State management
│   ├── utils/                 # Utility functions
│   └── styles/                # Global styles
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🎨 Customization

### Portfolio Content
Edit the portfolio data in `src/data/portfolioData.ts`:

```typescript
export const portfolioData = {
  personal: {
    name: "Your Name",
    title: "Your Title",
    bio: "Your bio...",
    experience: 5
  },
  projects: [
    {
      title: "Project Name",
      description: "Project description...",
      technologies: ["React", "Three.js"],
      link: "https://project-url.com"
    }
  ],
  // ... more data
};
```

### Visual Customization
- **Colors**: Modify the cyberpunk color palette in `src/data/cityConfig.ts`
- **Buildings**: Adjust building generation parameters
- **Effects**: Configure post-processing effects in `src/components/3d/Effects.tsx`

### Performance Settings
Adjust performance settings in `src/utils/performanceUtils.ts`:

```typescript
export const qualitySettings = {
  high: { /* high-end settings */ },
  medium: { /* mid-range settings */ },
  low: { /* low-end settings */ }
};
```

## 📱 Device Compatibility

### Minimum Requirements
- **WebGL 1.0** support (WebGL 2.0 recommended)
- **Modern browser** (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **2GB RAM** minimum (4GB+ recommended)

### Automatic Optimization
The portfolio automatically detects device capabilities and adjusts:
- **Graphics quality** based on GPU performance
- **Particle count** for mobile devices
- **Shadow quality** and post-processing effects
- **Texture resolution** and LOD distances

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Manual Deployment
```bash
npm run build
npm run export  # For static export
```

### Environment Variables
Set these in your deployment platform:
- `NEXT_PUBLIC_GA_ID`: Google Analytics ID
- `NEXT_PUBLIC_SITE_URL`: Your domain URL
- `NEXT_PUBLIC_GITHUB_URL`: Your GitHub profile
- `NEXT_PUBLIC_LINKEDIN_URL`: Your LinkedIn profile
- `NEXT_PUBLIC_EMAIL`: Your contact email

## 🔧 Performance Optimization

### Built-in Optimizations
- **Level of Detail (LOD)**: Reduces geometry complexity at distance
- **Frustum Culling**: Hides objects outside camera view
- **Object Pooling**: Reuses objects to reduce garbage collection
- **Texture Atlasing**: Combines textures to reduce draw calls
- **Instanced Rendering**: Efficiently renders repeated objects

### Monitoring
The portfolio includes built-in performance monitoring:
- **FPS tracking** with automatic quality adjustment
- **Memory usage** monitoring
- **Draw call** and triangle counting
- **Device capability** detection

## 🎵 Audio System

The optional audio system provides:
- **Ambient cyberpunk soundscape**
- **3D positional audio** for hover cars and effects
- **Interactive sound effects** for UI elements
- **Volume controls** and mute functionality

Enable audio by setting `NEXT_PUBLIC_ENABLE_AUDIO=true` in your environment variables.

## 🧪 Testing

### Performance Testing
```bash
npm run test:performance
```

### Cross-browser Testing
```bash
npm run test:browsers
```

### Accessibility Testing
```bash
npm run test:a11y
```

## 📊 Analytics

The portfolio includes analytics for:
- **User interactions** with 3D elements
- **Performance metrics** across different devices
- **Feature usage** and engagement
- **Error tracking** and debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** community for the amazing 3D library
- **React Three Fiber** team for the React integration
- **Vercel** for the excellent deployment platform
- **Cyberpunk 2077** for visual inspiration

## 📞 Contact

- **Email**: aashish@example.com
- **GitHub**: [@aashishsachdeva](https://github.com/aashishsachdeva)
- **LinkedIn**: [Aashish Sachdeva](https://linkedin.com/in/aashishsachdeva)
- **Portfolio**: [https://aashish-portfolio.vercel.app](https://aashish-portfolio.vercel.app)

---

Built with ❤️ and lots of ☕ by [Aashish Sachdeva](https://github.com/aashishsachdeva)