import { supabase } from '@/integrations/supabase/client';
import { OutlineGenerationParams, OutlineNode, Outline } from '@/types/outline';
import { toast } from '@/hooks/use-toast';

// Cache for storing AI responses to avoid redundant API calls
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number; // expiration time in milliseconds
}

// Simple in-memory cache (this would be replaced with a more robust solution in production)
const responseCache = new Map<string, CacheEntry>();

// Service to handle interactions with Claude API via Supabase Edge Functions
export const claudeService = {
  // Generate outline content with Claude
  async generateOutlineContent(params: OutlineGenerationParams): Promise<OutlineNode[] | null> {
    try {
      // Create a cache key based on request parameters
      const cacheKey = this.generateCacheKey(params);
      
      // Check if we have a valid cached response
      const cachedResponse = this.getFromCache(cacheKey);
      if (cachedResponse) {
        console.log('Using cached Claude response');
        return cachedResponse;
      }
      
      // Apply rate limiting
      if (!this.checkRateLimit()) {
        toast({
          title: 'API Rate Limit Reached',
          description: 'Please wait a moment before generating more content.',
          variant: 'destructive',
        });
        return null;
      }
      
      // Construct prompt based on project configuration
      const prompt = constructPrompt(params);
      
      // Call Supabase Edge Function that interacts with Claude API
      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: {
          prompt,
          model: params.model,
          projectConfig: params.projectConfig,
          structureType: params.structureType || 'sequential',
          referenceUrls: params.referenceUrls || [],
          references: params.references || []
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
      
      // Parse Claude's response
      const parsedOutline = this.processClaudeResponse(data.outline, params);
      
      // Cache the successful response
      this.addToCache(cacheKey, parsedOutline, 30 * 60 * 1000); // Cache for 30 minutes
      
      return parsedOutline;
    } catch (error) {
      console.error('Error generating outline with Claude:', error);
      
      // Handle common API errors
      let errorMessage = 'There was an issue connecting to Claude. Please try again later.';
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (error.message.includes('authorization')) {
          errorMessage = 'API authorization error. Please check your API key.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'The request timed out. Please try again.';
        }
      }
      
      toast({
        title: 'AI Generation Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  },
  
  // Generate summary of an outline
  async generateOutlineSummary(outline: Outline): Promise<string | null> {
    try {
      // Create a cache key for summary request
      const cacheKey = `summary-${outline.id}-${outline.version}`;
      
      // Check cache
      const cachedSummary = this.getFromCache(cacheKey);
      if (cachedSummary) {
        return cachedSummary;
      }
      
      // Apply rate limiting
      if (!this.checkRateLimit()) {
        toast({
          title: 'API Rate Limit Reached',
          description: 'Please wait a moment before generating more content.',
          variant: 'destructive',
        });
        return null;
      }

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
      
      const summary = data?.outline || null;
      
      // Cache the summary
      if (summary) {
        this.addToCache(cacheKey, summary, 60 * 60 * 1000); // Cache for 1 hour
      }
      
      return summary;
    } catch (error) {
      console.error('Error generating outline summary:', error);
      toast({
        title: 'Summary Generation Error',
        description: 'Failed to generate outline summary. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  },
  
  // Suggest improvements for content based on standards
  async suggestImprovements(outline: Outline, standards: string[]): Promise<string | null> {
    try {
      // Create a cache key
      const cacheKey = `improvements-${outline.id}-${outline.version}-${standards.join('-')}`;
      
      // Check cache
      const cachedSuggestions = this.getFromCache(cacheKey);
      if (cachedSuggestions) {
        return cachedSuggestions;
      }
      
      // Apply rate limiting
      if (!this.checkRateLimit()) {
        toast({
          title: 'API Rate Limit Reached',
          description: 'Please wait a moment before generating more content.',
          variant: 'destructive',
        });
        return null;
      }

      const prompt = `Analyze this educational outline and suggest improvements to better align with these educational standards: ${standards.join(', ')}
      
Outline title: ${outline.title}
Structure type: ${outline.structureType || 'sequential'}
Main sections: ${outline.rootNodes.map(node => node.title).join(', ')}

Please suggest:
1. Areas where standards coverage could be improved
2. Additional topics that should be included
3. Better alignment between content and standards
4. More effective assessment strategies`;

      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: {
          prompt,
          model: 'claude-3-haiku',
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
      const suggestions = data?.outline || null;
      
      // Cache the suggestions
      if (suggestions) {
        this.addToCache(cacheKey, suggestions, 60 * 60 * 1000); // Cache for 1 hour
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error generating improvement suggestions:', error);
      toast({
        title: 'Suggestions Error',
        description: 'Failed to generate improvement suggestions. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }
  },
  
  // Cache management methods
  generateCacheKey(params: OutlineGenerationParams): string {
    // Create a deterministic key based on important parameters
    return `outline-${params.model}-${params.structureType}-${params.detailLevel}-${params.projectConfig.id}-v1`;
  },
  
  getFromCache(key: string): any {
    const cached = responseCache.get(key);
    
    // Return null if not in cache or expired
    if (!cached || Date.now() > cached.timestamp + cached.expiresIn) {
      if (cached) {
        responseCache.delete(key); // Clear expired entry
      }
      return null;
    }
    
    return cached.data;
  },
  
  addToCache(key: string, data: any, expiresIn: number): void {
    responseCache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
    
    // Keep cache size manageable
    if (responseCache.size > 50) {
      // Remove oldest entry
      const oldestKey = responseCache.keys().next().value;
      responseCache.delete(oldestKey);
    }
  },
  
  // Basic rate limiting
  lastRequestTime: 0,
  minimumRequestInterval: 2000, // 2 seconds between requests
  
  checkRateLimit(): boolean {
    const now = Date.now();
    if (now - this.lastRequestTime < this.minimumRequestInterval) {
      return false;
    }
    this.lastRequestTime = now;
    return true;
  },
  
  // Process Claude API response into proper OutlineNode structure
  processClaudeResponse(responseText: string, params: OutlineGenerationParams): OutlineNode[] {
    try {
      // Try to parse as JSON first (in case Claude returned valid JSON)
      console.log('Processing Claude response:', responseText.substring(0, 100) + '...');
      
      try {
        // Attempt to parse the response directly
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed)) {
          console.log('Claude returned array of nodes');
          return parsed;
        }
        if (parsed.rootNodes && Array.isArray(parsed.rootNodes)) {
          console.log('Claude returned object with rootNodes array');
          return parsed.rootNodes;
        }
        
        console.log('Claude returned JSON but not in expected format:', parsed);
      } catch (jsonError) {
        console.log('Initial JSON parse failed, trying to extract JSON from text response');
      }
      
      // Try to extract JSON from a text response
      // Look for JSON-like patterns in the response
      const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/); // Match array of objects
      if (jsonMatch) {
        try {
          const extractedJson = jsonMatch[0];
          console.log('Extracted JSON from text response');
          const parsedExtracted = JSON.parse(extractedJson);
          if (Array.isArray(parsedExtracted)) {
            return parsedExtracted;
          }
        } catch (extractError) {
          console.error('Failed to parse extracted JSON:', extractError);
        }
      }
      
      // If we still can't parse it, fall back to generating nodes
      console.log('Falling back to generated outline nodes');
      
      // Import the generator function from outlineGeneration service
      const { generateOutlineNodes } = require('./outlineGeneration');
      
      return generateOutlineNodes(
        params.projectConfig,
        params.detailLevel,
        params.includeAssessments,
        params.includeActivities,
        0,
        [],
        params.structureType
      );
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      console.log('Raw Claude response:', responseText);
      
      // Fall back to mock data
      const { generateOutlineNodes } = require('./outlineGeneration');
      return generateOutlineNodes(
        params.projectConfig,
        params.detailLevel,
        params.includeAssessments,
        params.includeActivities,
        0,
        [],
        params.structureType
      );
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
  
  // Add output format instructions
  prompt += `\n\nReturn the outline as a valid JSON array of OutlineNode objects with this structure:
[
  {
    "id": "unique-id",
    "title": "Section Title",
    "description": "Section description",
    "type": "section",
    "estimatedWordCount": 500,
    "estimatedDuration": 30,
    "standardIds": ["std-1", "std-2"],
    "taxonomyLevel": "understand",
    "difficultyLevel": "intermediate",
    "children": [
      // Child nodes with same structure
    ],
    "assessmentPoints": [
      {
        "id": "assessment-id",
        "description": "Assessment description",
        "taxonomyLevel": "apply",
        "standardIds": ["std-1"],
        "type": "formative"
      }
    ]
  }
]
`;

  return prompt;
}

export default claudeService;
