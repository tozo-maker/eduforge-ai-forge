
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
];

export default projectTemplates;
