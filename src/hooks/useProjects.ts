
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectConfig } from '@/types/project';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dbProjectToAppProject, DbProject } from '@/utils/projectMapping';

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Use useCallback to prevent infinite dependency loops
  const fetchProjects = useCallback(async (retryCount = 0) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const appProjects = (data as DbProject[]).map(dbProject => 
        dbProjectToAppProject(dbProject)
      );
      
      setProjects(appProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      
      // Only show toast on final retry
      if (retryCount >= 2) {
        toast({
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
          variant: 'destructive',
          duration: 3000, // Reduce duration for better UX
        });
      } else {
        // Implement retry logic with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        setTimeout(() => fetchProjects(retryCount + 1), retryDelay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user, fetchProjects]);

  return { projects, isLoading, error, fetchProjects };
};
