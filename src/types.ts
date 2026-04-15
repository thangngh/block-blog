export type UserRole = 'admin' | 'editor' | 'author' | 'guest';
export type UserStatus = 'pending' | 'accepted';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export type PostStatus = 'draft' | 'published' | 'review';

export interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'pdf' | 'embed' | 'heading' | 'bullet_list' | 'numbered_list' | 'todo_list' | 'quote' | 'table';
  content: string;
  metadata?: any;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: Block[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  currentVersionId: string;
}

export interface Version {
  id: string;
  postId: string;
  content: Block[];
  createdAt: string;
  authorId: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  postId: string;
  reviewerId: string;
  status: 'approved' | 'requested_changes';
  feedback: string;
  createdAt: string;
}
