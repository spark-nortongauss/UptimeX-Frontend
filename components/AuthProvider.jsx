"use client"

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

export default function AuthProvider({ children }) {
  const { initialize, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  return children;
}