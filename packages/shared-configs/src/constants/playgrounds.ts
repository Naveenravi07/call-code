import {
  Code,
  FileCode,
  Terminal,
  Zap,
  Shield,
  Coffee,
  Slash,
  Layout,
  Atom,
  Eye,
  Flame,
  Server,
  Send,
  Layers,
  Droplet,
  LucideIcon,
} from 'lucide-react';

export interface MeetingType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}


export const meetingTypes = [
  {
    id: 'javascript',
    title: 'JavaScript',
    description: 'Dynamic scripting language',
    icon: Code,
    color: 'text-yellow-500',
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    description: 'Typed superset of JavaScript',
    icon: FileCode,
    color: 'text-blue-600',
  },
  {
    id: 'python',
    title: 'Python',
    description: 'General-purpose programming language',
    icon: Terminal,
    color: 'text-green-600',
  },
  {
    id: 'go',
    title: 'Go',
    description: 'Compiled systems programming language',
    icon: Zap,
    color: 'text-cyan-600',
  },
  {
    id: 'rust',
    title: 'Rust',
    description: 'Memory-safe systems language',
    icon: Shield,
    color: 'text-orange-600',
  },
  {
    id: 'java',
    title: 'Java',
    description: 'Object-oriented language',
    icon: Coffee,
    color: 'text-red-700',
  },
  {
    id: 'vite',
    title: 'Vite',
    description: 'Next-gen frontend build tool',
    icon: Slash,
    color: 'text-purple-500',
  },
  {
    id: 'nextjs',
    title: 'Next.js',
    description: 'React framework with SSR support',
    icon: Layout,
    color: 'text-gray-900',
  },
  {
    id: 'react',
    title: 'React',
    description: 'UI library for building interfaces',
    icon: Atom,
    color: 'text-blue-500',
  },
  {
    id: 'vue',
    title: 'Vue.js',
    description: 'Progressive frontend framework',
    icon: Eye,
    color: 'text-green-500',
  },
  {
    id: 'svelte',
    title: 'Svelte',
    description: 'Radical new approach to UI',
    icon: Flame,
    color: 'text-orange-500',
  },
  {
    id: 'nest',
    title: 'NestJS',
    description: 'Scalable Node.js backend framework',
    icon: Server,
    color: 'text-rose-500',
  },
  {
    id: 'express',
    title: 'Express',
    description: 'Minimal Node.js web framework',
    icon: Send,
    color: 'text-gray-700',
  },
  {
    id: 'django',
    title: 'Django',
    description: 'Python web framework',
    icon: Layers,
    color: 'text-emerald-700',
  },
  {
    id: 'flask',
    title: 'Flask',
    description: 'Lightweight Python web framework',
    icon: Droplet,
    color: 'text-gray-500',
  },
] as const;
