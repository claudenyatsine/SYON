export type ForumCategory = {
  id: string;
  name: string;
  icon: string; // Tailwind bg color class or icon name
  textColor: string;
  memberCount: number;
  description: string;
};

export type ForumThread = {
  id: string;
  title: string;
  snippet: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryBg: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string; // Relative time string
  replies: number;
  views: number;
  isPinned?: boolean;
};

export const MOCK_CATEGORIES: ForumCategory[] = [
  {
    id: 'math',
    name: 'A-Level Mathematics',
    icon: 'bg-orange-100 text-orange-600',
    textColor: 'text-orange-600',
    memberCount: 1240,
    description: 'Calculus, algebra, and statistics discussions.',
  },
  {
    id: 'bio',
    name: 'O-Level Biology',
    icon: 'bg-emerald-100 text-emerald-600',
    textColor: 'text-emerald-600',
    memberCount: 892,
    description: 'Ecology, anatomy, and cellular biology.',
  },
  {
    id: 'general',
    name: 'General Discussion',
    icon: 'bg-purple-100 text-purple-600',
    textColor: 'text-purple-600',
    memberCount: 3420,
    description: 'Study tips, announcements, and off-topic chat.',
  },
];

export const MOCK_THREADS: ForumThread[] = [
  {
    id: '1',
    title: 'Tips for mastering Integration by Parts?',
    snippet: 'I always get stuck when choosing which part should be u and which should be dv. Any mnemonics?',
    categoryId: 'math',
    categoryName: 'A-Level Mathematics',
    categoryColor: 'text-orange-600',
    categoryBg: 'bg-orange-100',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://picsum.photos/seed/sarah/40',
    createdAt: '2 hours ago',
    replies: 14,
    views: 120,
    isPinned: true,
  },
  {
    id: '2',
    title: 'Photosynthesis vs Cellular Respiration comparison table',
    snippet: 'I made a quick study guide for the upcoming mock exam comparing the two processes. Let me know if I missed anything!',
    categoryId: 'bio',
    categoryName: 'O-Level Biology',
    categoryColor: 'text-emerald-600',
    categoryBg: 'bg-emerald-100',
    authorName: 'Michael Chang',
    authorAvatar: 'https://picsum.photos/seed/mike/40',
    createdAt: '5 hours ago',
    replies: 8,
    views: 89,
  },
  {
    id: '3',
    title: 'Best ambient study music playlists?',
    snippet: 'Looking for some good lo-fi or classical playlists on Spotify to help me focus during long study sessions.',
    categoryId: 'general',
    categoryName: 'General Discussion',
    categoryColor: 'text-purple-600',
    categoryBg: 'bg-purple-100',
    authorName: 'Emily Watson',
    authorAvatar: 'https://picsum.photos/seed/emily/40',
    createdAt: '1 day ago',
    replies: 42,
    views: 310,
  },
  {
    id: '4',
    title: 'Understanding the Chain Rule',
    snippet: 'Can someone explain the chain rule in simple terms? The textbook definition is really confusing me.',
    categoryId: 'math',
    categoryName: 'A-Level Mathematics',
    categoryColor: 'text-orange-600',
    categoryBg: 'bg-orange-100',
    authorName: 'David Kim',
    authorAvatar: 'https://picsum.photos/seed/david/40',
    createdAt: '2 days ago',
    replies: 23,
    views: 145,
  },
];

export const TRENDING_SUBJECTS = [
  { id: 'math', name: 'A-Level Mathematics', count: '1.2k Members' },
  { id: 'general', name: 'General Discussion', count: '3.4k Members' },
  { id: 'bio', name: 'O-Level Biology', count: '892 Members' },
];

export const FORUM_RULES = [
  'Be respectful to fellow students and tutors.',
  'Search before creating a new thread to avoid duplicates.',
  'Use appropriate tags and categories for your posts.',
  'No plagiarism or cheating requests allowed.',
  'Keep formatting clean and easy to read.',
];
