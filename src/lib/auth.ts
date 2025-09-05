import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from './supabase/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-here';

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
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const supabase = createClient();
  
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

export async function createUser(email: string, password: string, name: string): Promise<User | null> {
  const supabase = createClient();
  
  const hashedPassword = await hashPassword(password);
  
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: hashedPassword,
      name,
      role: 'admin'
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
  const supabase = createClient();
  
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
