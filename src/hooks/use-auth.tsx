"use client";

import React, { createContext, useContext } from 'react';
import useSWR, { type KeyedMutator } from 'swr';
import type { Profile } from '@prisma/client';

// Define the shape of the auth context
interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  error: any;
  login: (email: string, pass: string) => Promise<Profile>;
  signup: (email: string, pass: string, fullName: string) => Promise<Profile>;
  logout: () => Promise<void>;
  refreshUser: KeyedMutator<Profile | null>; // Add refreshUser to the type
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>(null!);

// Define a generic fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Use SWR to fetch the user data. It handles caching, revalidation, etc.
  const { data, error, isLoading, mutate } = useSWR<Profile | null>('/api/auth/user', fetcher);

  const user = error ? null : data;

  const login = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const userData = await res.json();
    if (!res.ok) throw new Error(userData.message || 'Login failed');
    await mutate(userData); // Update the local user data with the response from the login
    return userData;
  };

  const signup = async (email: string, pass: string, fullName: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, fullName }),
    });
    const newUser = await res.json();
    if (!res.ok) throw new Error(newUser.message || 'Signup failed');
    // Optionally, you could log the user in directly here by calling mutate(newUser)
    return newUser;
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Logout failed');
      }
      await mutate(null, { revalidate: false }); // Set user data to null immediately and prevent revalidation
    } catch (error) {
      console.error('An error occurred during logout:', error);
      throw error;
    }
  };

  const value = {
    user: user ?? null,
    loading: isLoading,
    error,
    login,
    signup,
    logout,
    refreshUser: mutate, // Implement refreshUser using SWR's mutate function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the useAuth hook for easy consumption
export const useAuth = () => {
  return useContext(AuthContext);
};
