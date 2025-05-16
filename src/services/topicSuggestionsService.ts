import { claudeService } from './claudeService';
import { Subject, GradeLevel } from '@/types/project';

export interface TopicSuggestion {
  subject: Subject;
  relevanceScore: number; 
  rationale: string;
}

export const topicSuggestionsService = {
  /**
   * Generate complementary subject recommendations based on primary subject
   */
  async getComplementarySubjects(
    primarySubject: Subject,
    gradeLevel: GradeLevel,
    learningObjectives: string[] = []
  ): Promise<TopicSuggestion[]> {
    try {
      console.log("Generating complementary subjects with Claude...");
      const objectivesText = learningObjectives.join('\n');
      
      const prompt = `Generate 3 complementary subject areas that would pair well with ${primarySubject.replace('_', ' ')} 
for ${gradeLevel} students, considering these learning objectives:

${objectivesText || "No specific objectives provided"}

Return your response as a JSON array with this format:
[
  {
    "subject": "subject_name",
    "relevanceScore": 85,
    "rationale": "Explanation of why this subject complements the primary subject"
  }
]

Where:
- "subject" must be one of: mathematics, science, language_arts, social_studies, foreign_language, arts, physical_education, computer_science, other
- "relevanceScore" is a number from 1-100 indicating how relevant this subject is
- "rationale" is a brief explanation of the interdisciplinary connection

Only return the JSON array with no additional text.`;

      const { data, error } = await claudeService.generateContent({
        prompt,
        model: 'claude-3-sonnet',
        format: 'json',
        temperature: 0.3
      });

      if (error || !data || !Array.isArray(data)) {
        console.error("Error generating topic suggestions:", error || "Invalid response format");
        // Fall back to the local function for mock data
        return getFallbackSuggestions(primarySubject, gradeLevel, learningObjectives);
      }

      console.log("Generated topic suggestions:", data);
      return data as TopicSuggestion[];
    } catch (error) {
      console.error("Failed to generate topic suggestions:", error);
      // Fall back to the local function
      return getFallbackSuggestions(primarySubject, gradeLevel, learningObjectives);
    }
  }
};

// Fallback function for when the API call fails
function getFallbackSuggestions(
  primarySubject: Subject,
  gradeLevel: GradeLevel,
  learningObjectives: string[] = []
): TopicSuggestion[] {
  // Map of subject combinations that work well together
  const complementarySubjectMap: Record<Subject, Subject[]> = {
    mathematics: ['science', 'computer_science', 'arts'],
    science: ['mathematics', 'language_arts', 'social_studies'],
    language_arts: ['social_studies', 'arts', 'foreign_language'],
    social_studies: ['language_arts', 'arts', 'foreign_language'],
    foreign_language: ['language_arts', 'social_studies', 'arts'],
    arts: ['language_arts', 'social_studies', 'science'],
    physical_education: ['science', 'social_studies', 'mathematics'],
    computer_science: ['mathematics', 'science', 'arts'],
    other: ['language_arts', 'mathematics', 'science'],
  };
  
  // Smart rationales for complementary subjects
  const getSubjectRationale = (subject: Subject, primarySubject: Subject): string => {
    const rationales: Record<string, Record<string, string>> = {
      mathematics: {
        science: "Quantitative skills enhance scientific inquiry and data analysis",
        computer_science: "Abstract mathematical concepts underpin computational thinking",
        arts: "Geometric patterns and proportions are fundamental to visual arts"
      },
      science: {
        mathematics: "Scientific concepts often require mathematical modeling and analysis",
        language_arts: "Science communication and reporting require strong writing skills",
        social_studies: "Scientific developments have profound historical and societal impacts"
      },
      language_arts: {
        social_studies: "Historical contexts and cultural understanding enrich literary analysis",
        arts: "Creative expression connects across written and visual mediums",
        foreign_language: "Linguistic foundations transfer between primary and secondary languages"
      }
    };
    
    // Return specific rationale if available, otherwise a generic one
    return rationales[primarySubject]?.[subject] || 
      `${subject.replace('_', ' ')} complements ${primarySubject.replace('_', ' ')} through interdisciplinary connections`;
  };
  
  // Generate relevance scores using objectives and grade level
  const getRelevanceScore = (subject: Subject, primarySubject: Subject): number => {
    // Base score from 70-90
    let score = 70 + Math.floor(Math.random() * 20);
    
    // Boost score if learning objectives mention keywords related to this subject
    const keywords: Record<Subject, string[]> = {
      mathematics: ['calculate', 'equation', 'number', 'pattern', 'quantitative'],
      science: ['experiment', 'hypothesis', 'observation', 'evidence', 'analyze'],
      language_arts: ['write', 'read', 'communicate', 'expression', 'literature'],
      social_studies: ['history', 'society', 'culture', 'civic', 'geography'],
      foreign_language: ['language', 'communication', 'culture', 'translate'],
      arts: ['creative', 'design', 'visual', 'express', 'aesthetic'],
      physical_education: ['movement', 'health', 'activity', 'coordination'],
      computer_science: ['code', 'program', 'algorithm', 'data', 'system'],
      other: []
    };
    
    // Check objectives for keywords
    if (learningObjectives.length > 0) {
      const objectivesText = learningObjectives.join(' ').toLowerCase();
      const relevantKeywords = keywords[subject] || [];
      
      relevantKeywords.forEach(keyword => {
        if (objectivesText.includes(keyword.toLowerCase())) {
          score += 5; // Boost for each relevant keyword found
        }
      });
    }
    
    // Cap at 100
    return Math.min(score, 100);
  };
  
  // Get the complementary subjects for the primary subject
  const complementarySubjects = complementarySubjectMap[primarySubject] || [];
  
  // Create suggestions with relevance scores and rationales
  return complementarySubjects
    .map(subject => ({
      subject: subject as Subject,
      relevanceScore: getRelevanceScore(subject as Subject, primarySubject),
      rationale: getSubjectRationale(subject as Subject, primarySubject)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance
}
