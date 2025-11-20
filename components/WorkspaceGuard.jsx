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
  const { workspaces, setWorkspaces, hasWorkspaces, loading, setLoading } = useWorkspaceStore();
  
  const [checkingWorkspaces, setCheckingWorkspaces] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // Routes that don't require workspace check
  const publicRoutes = ['/signin', '/signup', '/forgot-password', '/auth/callback', '/workspace'];
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
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          router.push('/signin');
          return;
        }

        // Fetch user workspaces
        const userWorkspaces = await workspaceService.getWorkspaces(token);
        setWorkspaces(userWorkspaces);
        
        setHasChecked(true);
        
        // If user has no workspaces and is not on workspace creation page, redirect to workspace creation
        if (!userWorkspaces || userWorkspaces.length === 0) {
          if (pathname !== '/workspace') {
            router.push('/workspace');
          }
        } else {
          // User has workspaces, allow normal navigation
          // If on workspace creation page, redirect to overview
          if (pathname === '/workspace') {
            router.push('/observability/overview');
          }
        }
      } catch (error) {
        console.error('Error checking workspaces:', error);
        // On error, assume user needs to create workspace
        if (pathname !== '/workspace') {
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
  if (checkingWorkspaces && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-950">Checking your workspaces...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user needs to create workspace
  if (!hasWorkspaces() && !isPublicRoute && hasChecked) {
    return null; // Will redirect to /workspace
  }

  return children;
}