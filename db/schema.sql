-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "publicId" VARCHAR(255) UNIQUE NOT NULL
);

-- Projects table (belongs to a user)
CREATE TABLE IF NOT EXISTS "Project" (
  "id" SERIAL PRIMARY KEY,
  "publicId" VARCHAR(255) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "domain" VARCHAR(255) NOT NULL,
  "ownerId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

-- Analytics table (belongs to a project)
CREATE TABLE IF NOT EXISTS "Analytics" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL UNIQUE REFERENCES "Project"("id") ON DELETE CASCADE,
  "totalPageVisits" INTEGER NOT NULL DEFAULT 0,
  "totalVisits" INTEGER NOT NULL DEFAULT 0,
  "avgDuration" NUMERIC,
  "bounceRate" NUMERIC
);

-- Sessions table (belongs to a project)
CREATE TABLE IF NOT EXISTS "Session" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "sessionId" VARCHAR(255) NOT NULL,
  "lastSeen" TIMESTAMP NOT NULL DEFAULT NOW(),
  "duration" INTEGER NOT NULL DEFAULT 0,
  "isBounce" BOOLEAN NOT NULL DEFAULT TRUE,
  "browser" VARCHAR(255),
  "os" VARCHAR(255),
  "device" VARCHAR(255),
  "country" VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Page views table (belongs to a project)
CREATE TABLE IF NOT EXISTS "PageView" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "sessionId" VARCHAR(255) NOT NULL,
  "path" VARCHAR(2048) NOT NULL,
  "referrer" VARCHAR(2048),
  "browser" VARCHAR(255),
  "os" VARCHAR(255),
  "device" VARCHAR(255),
  "country" VARCHAR(255),
  "city" VARCHAR(255),
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON "Project"("ownerId");
CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON "Session"("projectId");
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON "Session"("sessionId");
CREATE INDEX IF NOT EXISTS idx_page_views_project_id ON "PageView"("projectId");
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON "PageView"("sessionId");
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON "PageView"("timestamp");
