export type User = {
  id: number;
  email: string;
  name: string;
  publicId: string;
  googleId: string | null;
};

export type Project = {
  id: number;
  publicId: string;
  name: string;
  domain: string;
  ownerId: number;
};

export type Analytics = {
  id: number;
  projectId: number;
  totalPageVisits: number;
  totalVisits: number;
  avgDuration: number | null;
  bounceRate: number | null;
};

export type Session = {
  id: number;
  projectId: number;
  sessionId: string;
  lastSeen: Date;
  duration: number;
  isBounce: boolean;
  browser: string | null;
  os: string | null;
  device: string | null;
  country: string | null;
  createdAt: Date;
};

export type PageView = {
  id: number;
  projectId: number;
  sessionId: string;
  path: string;
  referrer: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  country: string | null;
  city: string | null;
  timestamp: Date;
};
