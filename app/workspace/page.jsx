'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { workspaceService } from '@/lib/services/workspaceService';
import { Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function CreateWorkspace() {
  const router = useRouter();
  const { user, getToken } = useAuthStore();
  const { addWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  
  const [workspaceName, setWorkspaceName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [hasWorkspaces, setHasWorkspaces] = useState(false);

  useEffect(() => {
    // Check if user already has workspaces
    const checkExistingWorkspaces = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/signin');
          return;
        }

        const workspaces = await workspaceService.getWorkspaces(token);
        if (workspaces && workspaces.length > 0) {
          setHasWorkspaces(true);
          // Redirect to overview if workspaces exist
          router.push('/observability/overview');
        }
      } catch (error) {
        console.error('Error checking workspaces:', error);
      }
    };

    if (user) {
      checkExistingWorkspaces();
    }
  }, [user, getToken, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!workspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    if (workspaceName.length < 3) {
      toast.error('Workspace name must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        router.push('/signin');
        return;
      }

      const workspace = await workspaceService.createWorkspace(token, {
        name: workspaceName.trim(),
      });

      // Add to store
      addWorkspace(workspace);
      setCurrentWorkspace(workspace);

      toast.success('Workspace created successfully!');
      
      // Redirect to overview page
      router.push('/observability/overview');
    } catch (error) {
      console.error('Error creating workspace:', error);
      if (error.message?.includes('already exists')) {
        toast.error('A workspace with this name already exists');
      } else {
        toast.error('Failed to create workspace. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't show the form if user has workspaces (will redirect)
  if (hasWorkspaces) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/assets/observone_logo_1080p.png"
              alt="Observone Logo"
              width={96}
              height={96}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Observone</h1>
        </div>

        <Card className="bg-white border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Create Your Workspace
            </CardTitle>
            <CardDescription className="text-gray-600">
              Get started by creating your first workspace
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="workspace-name" className="text-sm font-medium text-gray-700">
                  Workspace Name
                </label>
                <Input
                  id="workspace-name"
                  type="text"
                  placeholder="My Workspace"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                  required
                  minLength={3}
                  maxLength={50}
                />
                <p className="text-xs text-gray-500">
                  This will be your workspace name. Choose something memorable.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Workspace...
                  </>
                ) : (
                  <>
                    Create Workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}