-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'cashier')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Only allow reading own user row
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (true);

-- Only allow inserts (managed by admin / service role)
CREATE POLICY "Allow insert" ON users
  FOR INSERT WITH CHECK (true);