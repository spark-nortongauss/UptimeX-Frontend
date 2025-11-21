'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { workspaceService } from '@/lib/services/workspaceService';
import { Loader2 } from 'lucide-react';

export default function WorkspaceGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, getToken, initialized } = useAuthStore();
  const { workspaces, setWorkspaces, hasWorkspaces, loading, setLoading, shouldRevalidate, setLastFetchedAt } = useWorkspaceStore();

  const [checkingWorkspaces, setCheckingWorkspaces] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Routes that don't require workspace check
  const publicRoutes = ['/signin', '/signup', '/forgot-password', '/auth/callback', '/workspace', '/admin'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    // Skip workspace check for public routes
    if (isPublicRoute) {
      setCheckingWorkspaces(false);
      return;
    }

    // Only check workspaces when auth is initialized and user is logged in
    if (!initialized || !user) {
      if (initialized && !user) {
        // User is not logged in, redirect to signin
        router.push('/signin');
      }
      return;
    }

    const checkUserWorkspaces = async () => {
      try {
        const token = getToken();

        if (!token) {
          router.push('/signin');
          return;
        }

        // Check if user is Admin - Admin users don't need workspaces
        const { authService } = await import('@/lib/services/authService');
        const adminStatus = await authService.isAdmin(token);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          // Admin users skip workspace requirement
          setCheckingWorkspaces(false);
          setLoading(false);
          setHasChecked(true);
          return;
        }

        if (hasWorkspaces()) {
          setCheckingWorkspaces(false);
          if (shouldRevalidate()) {
            try {
              const fresh = await workspaceService.getWorkspaces(token);
              setWorkspaces(fresh);
              setLastFetchedAt(Date.now());
            } catch { }
          }
          return;
        }

        setLoading(true);
        const userWorkspaces = await workspaceService.getWorkspaces(token);
        setWorkspaces(userWorkspaces);
        setLastFetchedAt(Date.now());
        setHasChecked(true);

        if (!userWorkspaces || userWorkspaces.length === 0) {
          // Don't redirect admin users to workspace page
          if (pathname !== '/workspace' && !pathname.startsWith('/admin')) {
            router.push('/workspace');
          }
        }
      } catch (error) {
        console.error('Error checking workspaces:', error);
        // On error, assume user needs to create workspace (but not for admin users)
        if (pathname !== '/workspace' && !pathname.startsWith('/admin')) {
          router.push('/workspace');
        }
      } finally {
        setLoading(false);
        setCheckingWorkspaces(false);
      }
    };

    checkUserWorkspaces();
  }, [user, initialized, pathname, isPublicRoute, router, getToken, setWorkspaces, setLoading]);

  // Show loading state while checking workspaces
  // if (checkingWorkspaces && !isPublicRoute) {
  //   return (
  //     <div className="min-h-screen bg-gray-200 flex items-center justify-center">
  //       <div className="text-center">
  //         <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
  //         <p className="text-gray-950">Checking your workspaces...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Don't render children if user needs to create workspace (but allow admin users)
  if (!hasWorkspaces() && !isPublicRoute && hasChecked && !isAdmin) {
    return null; // Will redirect to /workspace
  }

  return children;
}