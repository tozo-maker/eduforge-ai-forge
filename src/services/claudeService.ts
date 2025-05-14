
import { supabase } from '@/integrations/supabase/client';
import { OutlineGenerationParams, OutlineNode, Outline } from '@/types/outline';
import { toast } from '@/hooks/use-toast';

// Service to handle interactions with Claude API via Supabase Edge Functions
export const claudeService = {
  // Generate outline content with Claude
  async generateOutlineContent(params: OutlineGenerationParams): Promise<OutlineNode[] | null> {
    try {
      // Construct prompt based on project configuration
      const prompt = constructPrompt(params);
      
      // Call Supabase Edge Function that interacts with Claude API
      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: {
          prompt,
          model: params.model,
          projectConfig: params.projectConfig,
          structureType: params.structureType || 'sequential'
        }
      });

      if (error) {
        console.error('Claude API error:', error);
        throw new Error(error.message);
      }

      // Check if data contains outline
      if (!data?.outline) {
        throw new Error('No outline content returned from Claude API');
      }
      
      // Parse Claude's response into proper OutlineNode structure
      // In a real implementation, we'd do more validation/processing here
      const parsedOutline = processClaudeResponse(data.outline, params);
      
      return parsedOutline;
    } catch (error) {
      console.error('Error generating outline with Claude:', error);
      toast({
        title: 'AI Generation Error',
        description: 'There was an issue connecting to Claude. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  },
  
  // Generate summary of an outline
  async generateOutlineSummary(outline: Outline): Promise<string | null> {
    try {
      const prompt = `Provide a concise summary of this educational outline:
      
Title: ${outline.title}
Description: ${outline.description}
Structure: ${outline.structureType || 'sequential'}
Sections: ${outline.rootNodes.map(node => node.title).join(', ')}

Include key learning objectives, estimated duration, and the main flow of topics.`;

      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: {
          prompt,
          model: 'claude-3-haiku',
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data?.outline || null;
    } catch (error) {
      console.error('Error generating outline summary:', error);
      return null;
    }
  }
};

// Helper function to construct a prompt based on project configuration
function constructPrompt(params: OutlineGenerationParams): string {
  const { projectConfig, detailLevel, includeAssessments, includeActivities, focusAreas, referenceUrls, structureType } = params;
  
  let prompt = `Create a detailed educational outline for a ${projectConfig.type || 'lesson'} on ${projectConfig.subject || 'general topic'} for ${projectConfig.gradeLevel || 'all levels'} students.`;
  
  // Add structure type
  prompt += `\nStructure the content in a ${structureType || 'sequential'} format.`;
  
  // Add learning objectives
  if (projectConfig.learningObjectives && projectConfig.learningObjectives.length > 0) {
    prompt += `\n\nLearning objectives include:`;
    projectConfig.learningObjectives.forEach(objective => {
      prompt += `\n- ${objective}`;
    });
  }
  
  // Add educational standards
  if (projectConfig.standards && projectConfig.standards.length > 0) {
    prompt += `\n\nAligns with these educational standards:`;
    projectConfig.standards.forEach(standard => {
      const stdId = typeof standard === 'object' ? standard.id : standard;
      prompt += `\n- ${stdId}`;
    });
  }
  
  // Add detail level preference
  prompt += `\n\nProvide a ${detailLevel} level of detail in the outline.`;
  
  // Add assessment and activity preferences
  if (includeAssessments) {
    prompt += `\nInclude assessment points throughout the outline.`;
  }
  
  if (includeActivities) {
    prompt += `\nInclude activities appropriate for this content.`;
  }
  
  // Add focus areas
  if (focusAreas && focusAreas.length > 0) {
    prompt += `\n\nFocus particularly on these areas:`;
    focusAreas.forEach(area => {
      prompt += `\n- ${area}`;
    });
  }
  
  // Add reference materials
  if (referenceUrls && referenceUrls.length > 0) {
    prompt += `\n\nIncorporate concepts from these reference materials:`;
    referenceUrls.forEach(url => {
      prompt += `\n- ${url}`;
    });
  }
  
  // Add structure format
  prompt += `\n\nReturn the outline as a structured JSON object that I can parse to create an educational outline.`;
  
  return prompt;
}

// Process Claude API response into proper OutlineNode structure
function processClaudeResponse(responseText: string, params: OutlineGenerationParams): OutlineNode[] {
  // In a real implementation, this would parse Claude's response into OutlineNodes
  // For now, we'll use the mock generator to create nodes
  // but in a real implementation, you'd adapt Claude's response
  
  try {
    // Try to parse as JSON first (in case Claude returned valid JSON)
    const parsed = JSON.parse(responseText);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed.rootNodes && Array.isArray(parsed.rootNodes)) {
      return parsed.rootNodes;
    }
    
    // If we got here, Claude returned JSON but not in the format we expected
    console.log('Claude returned unexpected JSON format, falling back to mock data');
    
    // Fall back to mock data (in a real implementation, you would parse what Claude returned)
    return [];
  } catch (error) {
    // Claude didn't return valid JSON, fall back to mock data
    console.error('Error parsing Claude response:', error);
    console.log('Raw Claude response:', responseText);
    
    // In a real implementation, you would try to parse Claude's text response
    return [];
  }
}
