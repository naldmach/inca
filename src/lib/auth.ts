import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createAdminClient } from './supabase/admin';

// Read lazily rather than at module load, so a missing value surfaces as a
// clear runtime error instead of breaking the build or, worse, silently
// signing tokens with a fallback string that is public in this repo.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. Add it to .env.local and to your deployment environment.'
    );
  }

  return secret;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_login?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: Omit<User, 'password_hash'>): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  // Resolved outside the try so a misconfigured secret fails loudly instead of
  // being swallowed as an invalid-token 401.
  const secret = getJwtSecret();

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const supabase = createAdminClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    return null;
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  return user;
}

// Role defaults to 'guest'. Callers that need an admin must ask for one
// explicitly, so no public signup path can create one by omission.
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'guest' = 'guest'
): Promise<User | null> {
  const supabase = createAdminClient();

  const hashedPassword = await hashPassword(password);

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: hashedPassword,
      name,
      role
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return user;
}

export async function getUserById(id: number): Promise<User | null> {
  const supabase = createAdminClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !user) {
    return null;
  }

  return user;
}
