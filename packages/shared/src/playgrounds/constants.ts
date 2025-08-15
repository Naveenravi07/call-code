import {
  Code,
  FileCode,
  Terminal,
  Zap,
  Droplet,
  LucideIcon,
} from 'lucide-react';

export interface Playground {
  id: PlaygroundType;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  web: boolean
}

export enum PlaygroundType {
  VITE = 'vite',
  NEXT = 'next',
}

export const playgroundList : Playground[] = [
  {
    id: PlaygroundType.VITE,
    title: 'Vite',
    description: 'Blazingly fast web framework',
    icon: Droplet,
    color: 'text-gray-500',
    web: true
  },
  {
    id: PlaygroundType.NEXT,
    title: 'Next',
    description: 'Powerful React framework',
    icon: Droplet,
    color: 'text-gray-500',
    web: true
  },
] as const;

