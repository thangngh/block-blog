import { useMemo } from 'react';
import { Post, UserProfile, Version, Comment, Review } from '../types';

const STORAGE_KEY = 'modern_blog_data';

interface AppData {
  users: UserProfile[];
  posts: Post[];
  versions: Record<string, Version[]>;
  comments: Record<string, Comment[]>;
  reviews: Record<string, Review[]>;
}

const INITIAL_DATA: AppData = {
  users: [
    {
      uid: 'admin-123',
      email: 'thangngh.00@gmail.com',
      displayName: 'Admin User',
      photoURL: 'https://picsum.photos/seed/admin/100/100',
      role: 'admin',
      status: 'accepted',
      createdAt: new Date().toISOString(),
    }
  ],
  posts: [],
  versions: {},
  comments: {},
  reviews: {},
};

export const getStorageData = (): AppData => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : INITIAL_DATA;
};

export const saveStorageData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const useBlogData = () => {
  return useMemo(() => ({
    getPosts: () => getStorageData().posts,
    getPost: (id: string) => getStorageData().posts.find(p => p.id === id),
    savePost: (post: Post) => {
      const data = getStorageData();
      const index = data.posts.findIndex(p => p.id === post.id);
      if (index >= 0) {
        data.posts[index] = post;
      } else {
        data.posts.push(post);
      }
      saveStorageData(data);
    },
    getVersions: (postId: string) => getStorageData().versions[postId] || [],
    addVersion: (postId: string, version: Version) => {
      const data = getStorageData();
      if (!data.versions[postId]) data.versions[postId] = [];
      data.versions[postId].push(version);
      saveStorageData(data);
    },
    getComments: (postId: string) => getStorageData().comments[postId] || [],
    addComment: (postId: string, comment: Comment) => {
      const data = getStorageData();
      if (!data.comments[postId]) data.comments[postId] = [];
      data.comments[postId].push(comment);
      saveStorageData(data);
    },
    getReviews: (postId: string) => getStorageData().reviews[postId] || [],
    addReview: (postId: string, review: Review) => {
      const data = getStorageData();
      if (!data.reviews[postId]) data.reviews[postId] = [];
      data.reviews[postId].push(review);
      saveStorageData(data);
    },
    getUsers: () => getStorageData().users,
    updateUser: (uid: string, updates: Partial<UserProfile>) => {
      const data = getStorageData();
      const index = data.users.findIndex(u => u.uid === uid);
      if (index >= 0) {
        data.users[index] = { ...data.users[index], ...updates };
        saveStorageData(data);
      }
    },
    addUser: (user: UserProfile) => {
      const data = getStorageData();
      if (!data.users.find(u => u.uid === user.uid)) {
        data.users.push(user);
        saveStorageData(data);
      }
    }
  }), []);
};
