import {
  Code,
  FileCode,
  Terminal,
  Zap,
  Droplet,
  LucideIcon,
} from 'lucide-react';

export interface MeetingType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  web: boolean
}

export const playgroundList : MeetingType[] = [
  {
    id: 'typescript',
    title: 'TypeScript',
    description: 'Typed superset of JavaScript',
    icon: FileCode,
    color: 'text-blue-600',
    web: false
  },
  {
    id: 'python',
    title: 'Python',
    description: 'General-purpose programming language',
    icon: Terminal,
    color: 'text-green-600',
    web: false
  },
  {
    id: 'go',
    title: 'Go',
    description: 'Compiled systems programming language',
    icon: Zap,
    color: 'text-cyan-600',
    web: false
  },
  {
    id: 'flask',
    title: 'Flask',
    description: 'Lightweight Python web framework',
    icon: Droplet,
    color: 'text-gray-500',
    web: true
  },
  {
    id: 'vite',
    title: 'Vite',
    description: 'Blazingly fast web framework',
    icon: Droplet,
    color: 'text-gray-500',
    web: true
  },
] as const;

export const playgroundListById = playgroundList.map(obj => obj.id) as unknown as [string, ...string[]];
