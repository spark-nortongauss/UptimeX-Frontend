'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { workspaceService } from '@/lib/services/workspaceService';
import { Loader2 } from 'lucide-react';

export default function WorkspaceGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, getToken, initialized } = useAuthStore();
  const { workspaces, setWorkspaces, hasWorkspaces, loading, setLoading, setLastFetchedAt } = useWorkspaceStore();

  const [checkingWorkspaces, setCheckingWorkspaces] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const adminCheckDoneRef = useRef(false);

  // Routes that don't require workspace check
  const publicRoutes = ['/signin', '/signup', '/forgot-password', '/auth/callback', '/workspace', '/admin'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Perform admin check ONCE on mount, not on every pathname change
  useEffect(() => {
    // Skip workspace check for public routes
    if (isPublicRoute) {
      setCheckingWorkspaces(false);
      return;
    }

    // Only check when auth is initialized and user is logged in
    if (!initialized || !user) {
      if (initialized && !user) {
        router.push('/signin');
      }
      return;
    }

    // If we've already checked admin status, don't check again
    if (adminCheckDoneRef.current) {
      return;
    }

    const performAdminCheck = async () => {
      try {
        const token = getToken();

        if (!token) {
          router.push('/signin');
          return;
        }

        // Check if user is Admin - ONLY do this once
        const { authService } = await import('@/lib/services/authService');
        try {
          const adminStatus = await authService.isAdmin(token);
          setIsAdmin(adminStatus);

          if (adminStatus) {
            // Admin users skip workspace requirement entirely
            adminCheckDoneRef.current = true;
            setCheckingWorkspaces(false);
            setLoading(false);
            setHasChecked(true);
            return;
          }
        } catch (error) {
          // If admin check times out, assume admin (safer fallback)
          if (error.name === 'AbortError') {
            console.warn('Admin check timed out in WorkspaceGuard - assuming admin');
            setIsAdmin(true);
            adminCheckDoneRef.current = true;
            setCheckingWorkspaces(false);
            setLoading(false);
            setHasChecked(true);
            return;
          }
          // For other errors, treat as non-admin
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }

        adminCheckDoneRef.current = true;
      } finally {
        setCheckingWorkspaces(false);
      }
    };

    performAdminCheck();
  }, [initialized, user, isPublicRoute, router, getToken]);

  // Separate effect for workspace loading (only for non-admin users)
  useEffect(() => {
    if (isPublicRoute || !initialized || !user || !adminCheckDoneRef.current) {
      return;
    }

    // Admin users don't need to load workspaces
    if (isAdmin) {
      return;
    }

    // For non-admin users: check if we already have workspaces cached
    if (hasWorkspaces()) {
      setCheckingWorkspaces(false);
      setLoading(false);
      setHasChecked(true);
      return;
    }

    const loadUserWorkspaces = async () => {
      try {
        const token = getToken();

        if (!token) {
          router.push('/signin');
          return;
        }

        // First time loading workspaces for non-admin user
        setLoading(true);
        const userWorkspaces = await workspaceService.getWorkspaces(token);
        setWorkspaces(userWorkspaces);
        setLastFetchedAt(Date.now());
        setHasChecked(true);

        if (!userWorkspaces || userWorkspaces.length === 0) {
          // No workspaces, redirect to workspace creation
          if (pathname !== '/workspace' && !pathname.startsWith('/admin')) {
            router.push('/workspace');
          }
        }
      } catch (error) {
        console.error('Error checking workspaces:', error);
        // On error, redirect to workspace creation
        if (pathname !== '/workspace' && !pathname.startsWith('/admin')) {
          router.push('/workspace');
        }
      } finally {
        setLoading(false);
        setCheckingWorkspaces(false);
      }
    };

    loadUserWorkspaces();
  }, [isAdmin, initialized, user, isPublicRoute, router, getToken, pathname]);

  // Don't render children if user needs to create workspace (but allow admin users)
  if (!hasWorkspaces() && !isPublicRoute && hasChecked && !isAdmin) {
    return null; // Will redirect to /workspace
  }

  return children;
}