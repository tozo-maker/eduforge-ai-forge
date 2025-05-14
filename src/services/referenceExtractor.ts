
import { toast } from '@/hooks/use-toast';
import { Reference } from '@/types/outline';
import { supabase } from '@/integrations/supabase/client';

interface ExtractedReference {
  reference: Reference;
  extractedContent: string;
  keyTerms: string[];
  summary: string;
}

export const referenceExtractor = {
  // Extract content from a reference URL
  async extractContent(reference: Reference): Promise<ExtractedReference | null> {
    try {
      // Call Supabase Edge Function to extract content (will be implemented)
      const { data, error } = await supabase.functions.invoke('extract-reference-content', {
        body: { reference }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from extraction service');
      }

      return {
        reference,
        extractedContent: data.content || '',
        keyTerms: data.keyTerms || [],
        summary: data.summary || ''
      };
    } catch (error) {
      console.error('Error extracting reference content:', error);
      toast({
        title: 'Extraction Failed',
        description: 'Could not extract content from the reference URL.',
        variant: 'destructive',
      });
      return null;
    }
  },

  // Analyze outline and suggest where references should be used
  async suggestReferencePlacements(
    outlineNodes: any[], 
    references: Reference[]
  ): Promise<Record<string, string[]>> {
    try {
      if (!references || references.length === 0) {
        return {};
      }

      // Call Supabase Edge Function for suggestion analysis
      const { data, error } = await supabase.functions.invoke('suggest-reference-placements', {
        body: { 
          outlineNodes: JSON.stringify(outlineNodes),
          references: JSON.stringify(references)
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Return mapping of node IDs to reference IDs
      return data?.placements || {};
    } catch (error) {
      console.error('Error suggesting reference placements:', error);
      toast({
        title: 'Suggestion Failed',
        description: 'Could not analyze references for placement suggestions.',
        variant: 'destructive',
      });
      return {};
    }
  },

  // For now, implement a simple fallback that doesn't require API call
  // This provides immediate functionality while the edge function is being developed
  generateLocalReferenceSuggestions(
    outlineNodes: any[], 
    references: Reference[]
  ): Record<string, string[]> {
    const results: Record<string, string[]> = {};
    
    // Simple keyword matching algorithm
    const processNode = (node: any) => {
      // For each node, check if any reference titles or notes match the content
      const matchingRefs: string[] = [];
      
      references.forEach(ref => {
        const keywords = this.extractKeywords(ref);
        
        // Check if any keywords are in the node title or description
        if (keywords.some(kw => 
          node.title?.toLowerCase().includes(kw.toLowerCase()) || 
          node.description?.toLowerCase().includes(kw.toLowerCase())
        )) {
          matchingRefs.push(ref.id);
        }
      });
      
      // If we found matches, add to results
      if (matchingRefs.length > 0) {
        results[node.id] = matchingRefs;
      }
      
      // Process children recursively
      if (node.children && node.children.length > 0) {
        node.children.forEach(processNode);
      }
    };
    
    outlineNodes.forEach(processNode);
    
    return results;
  },
  
  // Extract keywords from a reference
  extractKeywords(ref: Reference): string[] {
    const keywords: string[] = [];
    
    // Extract from title
    if (ref.title) {
      const titleWords = ref.title
        .split(' ')
        .filter(word => word.length > 3)
        .map(word => word.toLowerCase());
      
      keywords.push(...titleWords);
    }
    
    // Extract from notes
    if (ref.notes) {
      const notesWords = ref.notes
        .split(' ')
        .filter(word => word.length > 3)
        .map(word => word.toLowerCase());
      
      // Only add words that appear more than once or seem significant
      const wordCounts = new Map<string, number>();
      notesWords.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
      
      const significantWords = Array.from(wordCounts.entries())
        .filter(([word, count]) => count > 1 || word.length > 6)
        .map(([word]) => word);
      
      keywords.push(...significantWords);
    }
    
    // Deduplicate
    return Array.from(new Set(keywords));
  }
};

export default referenceExtractor;
