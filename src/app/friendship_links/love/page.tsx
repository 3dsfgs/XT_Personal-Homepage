import type { Metadata } from 'next';
import LoveExplorer from './LoveExplorer';
export const metadata: Metadata = {
  title: '爱与关系探索 | Love & Relationships',
  description: '匿名探索人际依附风格、爱情故事地图与八种爱情风格。即时计分、不保存任何答题记录。',
};
export default function LoveExplorerPage() { return <LoveExplorer />; }
