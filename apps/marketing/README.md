# BrepFlow Marketing Website

Modern, engaging marketing frontend for BrepFlow - the web-first parametric CAD platform.

## 🎨 Design Philosophy

The marketing site embodies BrepFlow's revolutionary approach to CAD with:

- **Dark, Professional Aesthetic**: Reflects the technical nature of CAD software
- **Gradient Accents**: Blue → Purple → Pink gradients for modern appeal
- **Glassmorphism**: Subtle blur effects for depth and sophistication
- **Interactive Elements**: 3D backgrounds, animations, and live demos
- **Mobile-First**: Fully responsive design that works everywhere

## 🚀 Key Features

### Hero Section

- Dynamic typewriter text animations
- 3D node flow visualization background
- Particle field effects
- Clear value proposition messaging
- Prominent CTAs for demo and GitHub

### Features Showcase

- Bento grid layout for visual hierarchy
- Interactive feature cards with hover effects
- Icon-based feature representation
- Technical specifications highlight

### Live Demo

- Interactive product demonstration
- Step-by-step workflow visualization
- Fullscreen mode for immersive experience
- Progress tracking and controls

### Comparison Table

- Side-by-side competitor analysis
- Visual indicators (✓/✗) for quick scanning
- BrepFlow advantages highlighting
- Responsive table design

### Community Section

- GitHub stats integration
- Resource links (Discord, Forum, Docs)
- Newsletter signup with gradient design
- Community contribution emphasis

## 🛠️ Technology Stack

- **React 18**: Modern component architecture
- **TypeScript**: Type-safe development
- **Framer Motion**: Smooth animations and interactions
- **Three.js/React Three Fiber**: 3D visualizations
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tooling
- **Lucide Icons**: Consistent iconography

## 📁 Project Structure

```
apps/marketing/
├── src/
│   ├── components/
│   │   ├── Hero.tsx              # Landing hero section
│   │   ├── Features.tsx          # Feature showcase
│   │   ├── LiveDemo.tsx          # Interactive demo
│   │   ├── Comparison.tsx        # Competitor comparison
│   │   ├── Community.tsx         # Community section
│   │   ├── Navigation.tsx        # Site navigation
│   │   ├── Footer.tsx            # Site footer
│   │   └── ui/                   # Reusable UI components
│   │       ├── GlowButton.tsx    # Glowing CTA buttons
│   │       ├── BentoGrid.tsx     # Grid layout system
│   │       ├── FeatureCard.tsx   # Feature display cards
│   │       └── ...
│   ├── styles/
│   │   └── globals.css           # Global styles & Tailwind
│   ├── utils/
│   │   └── cn.ts                 # Class name utilities
│   └── App.tsx                   # Main application
├── public/
│   └── demos/                    # Demo videos/assets
├── package.json
├── tailwind.config.js            # Tailwind configuration
├── vite.config.ts                # Vite configuration
└── tsconfig.json                 # TypeScript config
```

## 🎯 Design System

### Colors

- **Background**: Deep grays (#0a0a0a to #1a1a1a)
- **Primary**: Purple (#8b5cf6)
- **Accent**: Blue to Purple gradient
- **Text**: White/Gray hierarchy

### Typography

- **Headings**: Inter, bold weights
- **Body**: Inter, regular
- **Code**: JetBrains Mono

### Components

- **Buttons**: Glow effects with gradient borders
- **Cards**: Glassmorphic with subtle borders
- **Animations**: Smooth, purposeful transitions
- **Layout**: Responsive grid systems

## 🚦 Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🔧 Configuration

### Environment Variables

```env
VITE_API_URL=https://api.brepflow.com
VITE_STUDIO_URL=https://studio.brepflow.com
VITE_DOCS_URL=https://docs.brepflow.com
```

### Performance Optimizations

- Lazy loading for heavy components
- Image optimization with next-gen formats
- Code splitting for faster initial load
- Prefetching for critical resources

## 📊 Analytics Integration

Ready for:

- Google Analytics 4
- Hotjar heatmaps
- Custom event tracking
- Conversion funnel optimization

## 🌐 SEO & Meta Tags

- Open Graph tags for social sharing
- Twitter Card meta tags
- Structured data for search engines
- Sitemap generation
- robots.txt configuration

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS/Android)

## 🎬 Animation Guidelines

- **Entrance**: Fade + slide up (0.6s ease-out)
- **Hover**: Scale 1.02 with shadow enhancement
- **Page transitions**: Smooth scroll with progress indicator
- **Loading states**: Skeleton screens with shimmer

## 🚀 Deployment

The marketing site is optimized for:

- **Vercel**: Automatic deployments from GitHub
- **Netlify**: Alternative hosting option
- **CloudFlare Pages**: Edge deployment
- **Traditional hosting**: Static export support

## 📈 Performance Metrics

Target metrics:

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Lighthouse Score**: 95+

---

Built with ❤️ for the future of parametric CAD
