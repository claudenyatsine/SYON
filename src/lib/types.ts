
export type UserRole = 'Student' | 'Tutor' | 'Parent' | 'School Admin';

export type Subject = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  courses: Course[];
};

export type Course = {
  id: string;
  name: string;
  description: string;
  tutor: string;
  duration: string;
  curriculum: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz';
  duration: number; // in minutes
};

export type Community = {
  id: string;
  name: string;
  description: string;
  members: number;
  posts: Post[];
};

export type Post = {
  id: string;
  title: string;
  author: User;
  createdAt: string;
  content: string;
  comments: Comment[];
  commentCount: number;
};

export type Comment = {
  id: string;
  author: User;
  createdAt: string;
  content: string;
  replies: Comment[];
};

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  avatarHint: string;
};

export type Resource = {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'article' | 'worksheet' | 'word' | 'excel' | 'ppt' | 'mp3';
  url: string;
  size: string;
  image: string;
  imageHint: string;
};

export type ResourceTopic = {
  id: string;
  title: string;
  resources: Resource[];
};

export type ResourceSubject = {
  id: string;
  title: string;
  topics: ResourceTopic[];
};

export type LiveClass = {
  id: string;
  title: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  time?: string;
  schedule?: string;
  students?: number;
  imageUrl?: string;
  imageHint?: string;
  agora_channel_name?: string;
  dyteMeetingId?: string; // Legacy
  recording_url?: string;
  tutor?: {
    full_name: string;
    avatar_url?: string;
  };
}
