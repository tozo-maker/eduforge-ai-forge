
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectConfig } from '@/types/project';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dbProjectToAppProject, appProjectToDbProject, DbProject } from '@/utils/projectMapping';

export const useProject = (projectId?: string) => {
  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  const fetchProject = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setProject(dbProjectToAppProject(data as DbProject));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch project'));
      toast({
        title: 'Error',
        description: 'Failed to load project details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async (projectData: Partial<ProjectConfig>) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Saving project with data:", projectData);
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!projectData.name) {
        throw new Error('Project name is required');
      }
      
      if (!projectData.type) {
        throw new Error('Project type is required');
      }
      
      // Prepare data for database
      const dbProjectData = appProjectToDbProject(projectData);
      console.log("Mapped to DB format:", dbProjectData);
      
      let savedProject;

      if (projectData.id) {
        // Update existing project
        console.log("Updating existing project with ID:", projectData.id);
        
        const { data, error } = await supabase
          .from('projects')
          .update({
            ...dbProjectData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectData.id)
          .select('*')
          .single();

        if (error) {
          console.error("Update project error:", error);
          throw new Error(error.message);
        }

        console.log("Project updated successfully:", data);
        savedProject = dbProjectToAppProject(data as DbProject);
        setProject(savedProject);
        toast({
          title: 'Success',
          description: 'Project updated successfully.',
        });
      } else {
        // Create new project
        console.log("Creating new project for user:", user.id);
        
        // Ensure learning objectives are properly formatted
        const learningObjectives = projectData.learningObjectives?.filter(obj => obj.trim()) || [];
        
        // Prepare standards in the correct format
        const standards = projectData.standards?.map(std => 
          typeof std === 'string' ? std : std.id
        ) || [];
        
        const { data, error } = await supabase
          .from('projects')
          .insert([
            {
              ...dbProjectData,
              user_id: user.id,
              title: projectData.name,
              learning_objectives: learningObjectives,
              standards: standards,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select('*')
          .single();

        if (error) {
          console.error("Create project error:", error);
          throw new Error(error.message);
        }

        console.log("Project created successfully:", data);
        savedProject = dbProjectToAppProject(data as DbProject);
        setProject(savedProject);
        toast({
          title: 'Success',
          description: 'Project created successfully.',
        });
      }
      
      return savedProject;
    } catch (err) {
      console.error("Error saving project:", err);
      setError(err instanceof Error ? err : new Error('Failed to save project'));
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save project.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!project?.id) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) {
        throw new Error(error.message);
      }

      setProject(null);
      toast({
        title: 'Success',
        description: 'Project deleted successfully.',
      });
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete project'));
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { project, isLoading, error, fetchProject, saveProject, deleteProject };
};
