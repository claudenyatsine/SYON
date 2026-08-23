export interface Community {
  id: string;
  name: string;
  description: string;
  members_count?: number;
}

export interface CommentType {
  id: string;
  text: string;
  author: string;
  user_id?: string;
  votes?: number;
  parent_id?: string | null;
  created_at?: string;
  avatar_url?: string;
}

export interface Post {
  id: string;
  subject_id: string;
  community_id?: string;
  user_id: string;
  title: string;
  content: string;
  tag: string;
  image_url?: string | null;
  is_research?: boolean;
  resource_url?: string | null;
  votes: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  community_name?: string;
  comments?: CommentType[];
}

export const mockCommunities: Community[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'A-Level Mathematics', description: 'Calculus, Algebra, and beyond.', members_count: 1240 },
  { id: '00000000-0000-0000-0000-000000000002', name: 'O-Level Biology', description: 'Cell biology, anatomy, ecosystems.', members_count: 890 },
  { id: '00000000-0000-0000-0000-000000000003', name: 'General Discussion', description: 'Talk about anything related to school.', members_count: 3400 },
];

export const initialMockPosts: Post[] = [
  {
    id: 'p1',
    subject_id: '00000000-0000-0000-0000-000000000001',
    community_id: '00000000-0000-0000-0000-000000000001',
    user_id: 'u1',
    title: 'Need help understanding Integration by Parts',
    content: 'Can someone explain the LIATE rule in simple terms? I am struggling with choosing u and dv...',
    tag: 'Question',
    votes: 42,
    created_at: '2024-01-01T10:00:00Z',
    author_name: 'John Doe',
    community_name: 'A-Level Mathematics',
    comments: [
      { id: 'c1', text: 'Great question! Im also struggling with this.', author: 'Student123' }
    ]
  },
  {
    id: 'p2',
    subject_id: '00000000-0000-0000-0000-000000000003',
    community_id: '00000000-0000-0000-0000-000000000003',
    user_id: 'u2',
    title: 'Study tips for finals week? 📚',
    content: 'What are your best strategies for avoiding burnout while reviewing a semester worth of notes?',
    tag: 'Discussion',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80',
    votes: 156,
    created_at: '2024-01-01T08:00:00Z',
    author_name: 'Jane Smith',
    community_name: 'General Discussion'
  }
];
