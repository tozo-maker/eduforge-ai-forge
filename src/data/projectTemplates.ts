
import { ProjectTemplate } from "@/types/project";

const projectTemplates: ProjectTemplate[] = [
  {
    id: "lesson-plan-5e",
    name: "5E Lesson Plan",
    description: "A structured lesson plan based on the 5E instructional model: Engage, Explore, Explain, Elaborate, and Evaluate.",
    type: "lesson_plan",
    icon: "book-open",
    previewImage: "/placeholder.svg",
    defaultConfig: {
      type: "lesson_plan",
      pedagogicalApproach: "inquiry_based",
      duration: "45_minutes",
      assessmentType: "formative"
    }
  },
  {
    id: "differentiated-lesson",
    name: "Differentiated Lesson",
    description: "Lesson plan with tiered activities for different learning levels and modalities.",
    type: "lesson_plan",
    icon: "grid-2x2",
    previewImage: "/placeholder.svg",
    defaultConfig: {
      type: "lesson_plan",
      pedagogicalApproach: "differentiated",
      accessibility: ["screen_reader_friendly", "multi_sensory"],
      duration: "60_minutes"
    }
  },
  {
    id: "standards-based-unit",
    name: "Standards-Based Unit",
    description: "Multi-lesson unit organized around specific educational standards.",
    type: "course_module",
    icon: "layout-list",
    previewImage: "/placeholder.svg",
    defaultConfig: {
      type: "course_module",
      pedagogicalApproach: "direct_instruction",
      duration: "multi_day",
      assessmentType: "summative"
    }
  },
  {
    id: "project-based-module",
    name: "Project-Based Module",
    description: "An extended learning experience centered on student-driven projects.",
    type: "course_module",
    icon: "folder",
    previewImage: "/placeholder.svg",
    defaultConfig: {
      type: "course_module",
      pedagogicalApproach: "project_based",
      duration: "multi_day",
      assessmentType: "performance_based"
    }
  },
  {
    id: "skill-assessment",
    name: "Skill Assessment",
    description: "Comprehensive assessment focused on measuring specific skills.",
    type: "assessment",
    icon: "circle-check",
    previewImage: "/placeholder.svg", 
    defaultConfig: {
      type: "assessment",
      assessmentType: "diagnostic",
      duration: "60_minutes"
    }
  },
  {
    id: "interactive-study-guide",
    name: "Interactive Study Guide",
    description: "A guide with interactive elements to support independent student learning.",
    type: "study_guide",
    icon: "book",
    previewImage: "/placeholder.svg",
    defaultConfig: {
      type: "study_guide",
      pedagogicalApproach: "flipped_classroom",
      accessibility: ["screen_reader_friendly", "alternative_text"]
    }
  },
  {
    id: "concept-map-guide",
    name: "Concept Map Guide",
    description: "Visual study guide that connects key concepts and relationships for better understanding.",
    type: "study_guide",
    icon: "grid-2x2",
    previewImage: "/placeholder.svg",
    defaultConfig: {
      type: "study_guide",
      pedagogicalApproach: "universal_design",
      accessibility: ["high_contrast", "alternative_text"]
    }
  },
  {
    id: "discussion-based-lesson",
    name: "Discussion-Based Lesson",
    description: "Lesson plan focused on Socratic questioning and student-led discussions.",
    type: "lesson_plan",
    icon: "file-text",
    previewImage: "/placeholder.svg",
    defaultConfig: {
      type: "lesson_plan",
      pedagogicalApproach: "socratic_method",
      duration: "60_minutes",
      assessmentType: "formative"
    }
  },
  {
    id: "cooperative-learning-unit",
    name: "Cooperative Learning Unit",
    description: "Unit designed around structured group activities for collaborative learning.",
    type: "course_module",
    icon: "folder",
    previewImage: "/placeholder.svg",
    defaultConfig: {
      type: "course_module",
      pedagogicalApproach: "cooperative_learning",
      duration: "multi_day",
      assessmentType: "performance_based"
    }
  },
  {
    id: "formative-assessment-collection",
    name: "Formative Assessment Collection",
    description: "Collection of diverse formative assessment techniques for ongoing feedback.",
    type: "assessment",
    icon: "circle-check",
    previewImage: "/placeholder.svg", 
    defaultConfig: {
      type: "assessment",
      assessmentType: "formative",
      duration: "15_minutes"
    }
  },
  {
    id: "performance-rubric-builder",
    name: "Performance Rubric Builder",
    description: "Tool to create detailed performance rubrics with measurable criteria.",
    type: "assessment",
    icon: "file-text",
    previewImage: "/placeholder.svg", 
    defaultConfig: {
      type: "assessment",
      assessmentType: "performance_based",
      duration: "multi_day"
    }
  },
  {
    id: "curriculum-map",
    name: "Curriculum Map",
    description: "Year-long curriculum plan with standards alignment and unit sequencing.",
    type: "curriculum",
    icon: "layout-list",
    previewImage: "/placeholder.svg", 
    defaultConfig: {
      type: "curriculum",
      pedagogicalApproach: "universal_design",
      duration: "multi_day"
    }
  }
];

export default projectTemplates;
