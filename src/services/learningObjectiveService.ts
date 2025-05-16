
import { claudeService } from './claudeService';
import { ProjectConfig, ProjectType, Subject, GradeLevel } from '@/types/project';

export const learningObjectiveService = {
  /**
   * Generate learning objectives based on project configuration
   */
  async generateLearningObjectives(
    projectName: string,
    projectType: ProjectType,
    description: string,
    subject: Subject,
    gradeLevel: GradeLevel
  ): Promise<string[]> {
    try {
      // Create a prompt for Claude to generate learning objectives
      const prompt = `Generate 4-6 learning objectives for an educational ${projectType} with the following details:
      
Project Name: ${projectName}
Subject: ${subject} 
Grade Level: ${gradeLevel}
Description: ${description || "No description provided"}

The learning objectives should:
1. Be specific, measurable, and appropriate for the grade level
2. Cover different cognitive levels (remembering, understanding, applying, analyzing, etc.)
3. Align with common standards for ${subject} at the ${gradeLevel} level
4. Be formatted as complete, action-oriented statements starting with "Students will be able to..."

Return ONLY the learning objectives as a JSON array of strings, with no explanation or other text.`;

      // Call Claude API via edge function
      const { data, error } = await claudeService.generateContent({
        prompt,
        model: 'claude-3-haiku',
        format: 'json',
        temperature: 0.2,
        maxTokens: 600
      });

      if (error) {
        console.error("Error generating learning objectives:", error);
        throw new Error(error.message);
      }

      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid response from AI service");
      }

      return data as string[];
    } catch (error) {
      console.error("Failed to generate learning objectives:", error);
      // Return some default objectives as fallback
      return [
        "Students will be able to identify key concepts related to the subject matter.",
        "Students will be able to demonstrate understanding through practical application.",
        "Students will be able to analyze and evaluate information critically."
      ];
    }
  }
};
