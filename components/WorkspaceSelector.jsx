'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { workspaceService } from '@/lib/services/workspaceService';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Building2, Users, Settings, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkspaceSelector() {
  const router = useRouter();
  const { getToken } = useAuthStore();
  const { workspaces, currentWorkspace, setCurrentWorkspace, setWorkspaces } = useWorkspaceStore();
  
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load workspaces when component mounts
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const userWorkspaces = await workspaceService.getWorkspaces(token);
      setWorkspaces(userWorkspaces);
      
      // Set current workspace if not set and workspaces exist
      if (!currentWorkspace && userWorkspaces.length > 0) {
        setCurrentWorkspace(userWorkspaces[0]);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      toast.error('Failed to load workspaces');
    }
  };

  const handleWorkspaceSelect = (workspace) => {
    setCurrentWorkspace(workspace);
    setIsOpen(false);
    
    // Navigate to overview page when workspace changes
    router.push('/observability/overview');
  };

  const handleCreateWorkspace = () => {
    setIsOpen(false);
    router.push('/workspace');
  };

  const handleWorkspaceSettings = () => {
    setIsOpen(false);
    // Navigate to workspace settings (you can implement this page later)
    toast.info('Workspace settings coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading workspaces...</span>
      </div>
    );
  }

  if (!currentWorkspace && workspaces.length === 0) {
    return (
      <Button
        onClick={() => router.push('/workspace')}
        variant="outline"
        size="sm"
        className="w-full justify-start"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Workspace
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between text-left font-normal"
        >
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {currentWorkspace?.name || 'Select Workspace'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleWorkspaceSelect(workspace)}
            className="cursor-pointer"
          >
            <div className="flex items-center space-x-2 flex-1">
              <Building2 className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{workspace.name}</div>
                {workspace.description && (
                  <div className="text-xs text-gray-500">{workspace.description}</div>
                )}
              </div>
              {currentWorkspace?.id === workspace.id && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCreateWorkspace}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Workspace
        </DropdownMenuItem>
        
        {currentWorkspace && (
          <DropdownMenuItem onClick={handleWorkspaceSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Workspace Settings
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}