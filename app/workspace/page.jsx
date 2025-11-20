'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/authStore';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { workspaceService } from '@/lib/services/workspaceService';

export default function CreateWorkspace() {
  const router = useRouter();
  const { user, getToken } = useAuthStore();
  const { addWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ensureAuth = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/signin');
        }
      } catch (error) {
        console.error('Error ensuring auth:', error);
      }
    };

    if (user) {
      ensureAuth();
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

      addWorkspace(workspace);
      setCurrentWorkspace(workspace);

      toast.success('Workspace created successfully!');
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

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative font-sans">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full p-6 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image
              src="/assets/observone_logo_1080p.png"
              fill
              className="object-contain"
              alt="Observone Logo"
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">Observone</span>
        </div>
      </nav>

      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl opacity-60 pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl opacity-60 pointer-events-none mix-blend-multiply" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[480px]"
        >
          <div className="mb-12">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
              Welcome to Observone!
            </h1>
            <p className="text-xl text-gray-500 font-medium">
              Create your first workspace to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="workspace" className="block text-sm font-semibold text-gray-900">
                Your new workspace
              </label>
              <div className="relative group">
                <input
                  id="workspace"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Workspace name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center gap-2.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white px-6 py-3.5 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create workspace
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}