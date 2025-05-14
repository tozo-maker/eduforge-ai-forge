
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectConfig, ProjectTemplate } from "@/types/project";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Layers, 
  BookMarked, 
  Globe, 
  Search,
  ArrowRight,
  CheckCircle,
  Brain,
  LayoutGrid
} from "lucide-react";

interface ProjectConfigWizardProps {
  template?: ProjectTemplate;
  onSave: (config: ProjectConfig) => void;
  onCancel: () => void;
}

// Define the steps in the configuration wizard
const WIZARD_STEPS = [
  { id: "basics", label: "Basic Information" },
  { id: "standards", label: "Educational Standards" },
  { id: "structure", label: "Content Structure" },
  { id: "accessibility", label: "Accessibility" },
  { id: "review", label: "Review & Create" }
];

// Educational standards categorized by region/organization
const EDUCATIONAL_STANDARDS = {
  "Common Core": [
    { id: "CCSS.ELA-LITERACY.RL.6.1", description: "Cite textual evidence to support analysis of what the text says" },
    { id: "CCSS.ELA-LITERACY.RL.6.2", description: "Determine a theme or central idea of a text" },
    { id: "CCSS.MATH.CONTENT.6.RP.A.1", description: "Understand the concept of a ratio" },
    { id: "CCSS.MATH.CONTENT.6.RP.A.2", description: "Understand the concept of a unit rate" },
  ],
  "NGSS": [
    { id: "MS-PS1-1", description: "Develop models to describe atomic composition of simple molecules" },
    { id: "MS-PS1-2", description: "Analyze and interpret data on properties of substances" },
  ],
  "International": [
    { id: "IB.MYP.SCI.1", description: "Explain scientific knowledge" },
    { id: "IB.MYP.SCI.2", description: "Apply scientific knowledge and understanding to solve problems" },
    { id: "IGCSE.BIO.1", description: "Characteristics and classification of living organisms" }
  ]
};

// Content structure options
const CONTENT_STRUCTURES = [
  { 
    id: "sequential", 
    name: "Sequential", 
    description: "Linear progression through topics, building on previous knowledge", 
    icon: ArrowRight 
  },
  { 
    id: "hierarchical", 
    name: "Hierarchical", 
    description: "Main concepts broken down into supporting details and examples", 
    icon: Layers 
  },
  { 
    id: "modular", 
    name: "Modular", 
    description: "Self-contained units that can be arranged flexibly", 
    icon: LayoutGrid 
  },
  { 
    id: "spiral", 
    name: "Spiral", 
    description: "Revisiting concepts with increasing complexity over time", 
    icon: Brain 
  },
];

export function ProjectConfigWizard({ template, onSave, onCancel }: ProjectConfigWizardProps) {
  const [currentStep, setCurrentStep] = useState<string>("basics");
  const [searchTerm, setSearchTerm] = useState("");
  
  const defaultConfig: ProjectConfig = {
    name: template?.name || "",
    description: "",
    type: template?.defaultConfig?.type || "lesson_plan",
    subject: template?.defaultConfig?.subject || "mathematics",
    gradeLevel: template?.defaultConfig?.gradeLevel || "6th",
    standards: [],
    learningObjectives: [],
    pedagogicalApproach: template?.defaultConfig?.pedagogicalApproach || "direct_instruction",
    culturalContext: template?.defaultConfig?.culturalContext || "general",
    accessibility: template?.defaultConfig?.accessibility || [],
    assessmentType: template?.defaultConfig?.assessmentType || "formative",
    duration: template?.defaultConfig?.duration || "45_minutes",
  };

  const [config, setConfig] = useState<ProjectConfig>(defaultConfig);
  const [objective, setObjective] = useState("");
  const [contentStructure, setContentStructure] = useState("sequential");

  const handleAddObjective = () => {
    if (objective.trim()) {
      setConfig({
        ...config,
        learningObjectives: [...config.learningObjectives, objective.trim()],
      });
      setObjective("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    setConfig({
      ...config,
      learningObjectives: config.learningObjectives.filter((_, i) => i !== index),
    });
  };

  const handleAccessibilityChange = (feature: any, checked: boolean) => {
    if (checked) {
      setConfig({
        ...config,
        accessibility: [...config.accessibility, feature],
      });
    } else {
      setConfig({
        ...config,
        accessibility: config.accessibility.filter(item => item !== feature),
      });
    }
  };

  const handleStandardSelect = (standardId: string) => {
    // Find the full standard object based on ID
    let standardObj;
    for (const category in EDUCATIONAL_STANDARDS) {
      const found = EDUCATIONAL_STANDARDS[category as keyof typeof EDUCATIONAL_STANDARDS].find(
        std => std.id === standardId
      );
      if (found) {
        standardObj = found;
        break;
      }
    }

    if (standardObj && !config.standards.some(std => std.id === standardId)) {
      setConfig({
        ...config,
        standards: [...config.standards, standardObj],
      });
    }
  };

  const handleRemoveStandard = (standardId: string) => {
    setConfig({
      ...config,
      standards: config.standards.filter(std => std.id !== standardId),
    });
  };

  const filteredStandards = () => {
    const results = [];
    for (const category in EDUCATIONAL_STANDARDS) {
      const standards = EDUCATIONAL_STANDARDS[category as keyof typeof EDUCATIONAL_STANDARDS].filter(
        std => 
          searchTerm === "" || 
          std.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
          std.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (standards.length > 0) {
        results.push({
          category,
          standards
        });
      }
    }
    return results;
  };

  const nextStep = () => {
    const currentIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      setCurrentStep(WIZARD_STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(WIZARD_STEPS[currentIndex - 1].id);
    }
  };

  const handleSubmit = () => {
    onSave(config);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Configure Your {template?.name || "Educational"} Project</CardTitle>
        <CardDescription>
          Complete the following steps to customize your project configuration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            {WIZARD_STEPS.map((step, index) => (
              <TabsTrigger key={step.id} value={step.id} className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs">
                  {index + 1}
                </span>
                <span>{step.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basics" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input 
                  id="name"
                  value={config.name} 
                  onChange={e => setConfig({...config, name: e.target.value})}
                  placeholder="Enter project name" 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={config.description || ""} 
                  onChange={e => setConfig({...config, description: e.target.value})}
                  placeholder="Brief description of your project" 
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={config.subject} 
                    onValueChange={value => setConfig({...config, subject: value as any})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="language_arts">Language Arts</SelectItem>
                      <SelectItem value="social_studies">Social Studies</SelectItem>
                      <SelectItem value="foreign_language">Foreign Language</SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                      <SelectItem value="physical_education">Physical Education</SelectItem>
                      <SelectItem value="computer_science">Computer Science</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select 
                    value={config.gradeLevel} 
                    onValueChange={value => setConfig({...config, gradeLevel: value as any})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="k">Kindergarten</SelectItem>
                      <SelectItem value="1st">1st Grade</SelectItem>
                      <SelectItem value="2nd">2nd Grade</SelectItem>
                      <SelectItem value="3rd">3rd Grade</SelectItem>
                      <SelectItem value="4th">4th Grade</SelectItem>
                      <SelectItem value="5th">5th Grade</SelectItem>
                      <SelectItem value="6th">6th Grade</SelectItem>
                      <SelectItem value="7th">7th Grade</SelectItem>
                      <SelectItem value="8th">8th Grade</SelectItem>
                      <SelectItem value="9th">9th Grade</SelectItem>
                      <SelectItem value="10th">10th Grade</SelectItem>
                      <SelectItem value="11th">11th Grade</SelectItem>
                      <SelectItem value="12th">12th Grade</SelectItem>
                      <SelectItem value="higher_education">Higher Education</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="pedagogicalApproach">Pedagogical Approach</Label>
                  <Select 
                    value={config.pedagogicalApproach} 
                    onValueChange={value => setConfig({...config, pedagogicalApproach: value as any})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select approach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct_instruction">Direct Instruction</SelectItem>
                      <SelectItem value="inquiry_based">Inquiry-Based Learning</SelectItem>
                      <SelectItem value="project_based">Project-Based Learning</SelectItem>
                      <SelectItem value="flipped_classroom">Flipped Classroom</SelectItem>
                      <SelectItem value="differentiated">Differentiated Instruction</SelectItem>
                      <SelectItem value="universal_design">Universal Design for Learning</SelectItem>
                      <SelectItem value="socratic_method">Socratic Method</SelectItem>
                      <SelectItem value="cooperative_learning">Cooperative Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="assessmentType">Assessment Type</Label>
                  <Select 
                    value={config.assessmentType} 
                    onValueChange={value => setConfig({...config, assessmentType: value as any})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formative">Formative</SelectItem>
                      <SelectItem value="summative">Summative</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic</SelectItem>
                      <SelectItem value="performance_based">Performance-Based</SelectItem>
                      <SelectItem value="peer_assessment">Peer Assessment</SelectItem>
                      <SelectItem value="self_assessment">Self Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select 
                    value={config.duration} 
                    onValueChange={value => setConfig({...config, duration: value as any})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15_minutes">15 Minutes</SelectItem>
                      <SelectItem value="30_minutes">30 Minutes</SelectItem>
                      <SelectItem value="45_minutes">45 Minutes</SelectItem>
                      <SelectItem value="60_minutes">60 Minutes</SelectItem>
                      <SelectItem value="90_minutes">90 Minutes</SelectItem>
                      <SelectItem value="multi_day">Multi-Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="culturalContext">Cultural Context</Label>
                  <Select 
                    value={config.culturalContext} 
                    onValueChange={value => setConfig({...config, culturalContext: value as any})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="multicultural">Multicultural</SelectItem>
                      <SelectItem value="indigenous">Indigenous</SelectItem>
                      <SelectItem value="culturally_responsive">Culturally Responsive</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Learning Objectives</Label>
                <div className="flex items-center mt-1 space-x-2">
                  <Input 
                    value={objective} 
                    onChange={e => setObjective(e.target.value)}
                    placeholder="Add a learning objective" 
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddObjective();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddObjective} size="sm">Add</Button>
                </div>
                {config.learningObjectives.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {config.learningObjectives.map((obj, index) => (
                      <div key={index} className="flex items-center justify-between bg-accent/50 p-2 rounded-md">
                        <span className="text-sm">{obj}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveObjective(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Educational Standards */}
          <TabsContent value="standards" className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search standards by ID or description..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="mt-4">
                <Label className="text-base font-medium">Selected Standards</Label>
                {config.standards.length === 0 ? (
                  <div className="text-sm text-muted-foreground mt-2 p-4 bg-accent/20 rounded-md">
                    No standards selected. Search and select standards from the list below.
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {config.standards.map((standard) => (
                      <div key={standard.id} className="flex items-center justify-between bg-accent/50 p-2 rounded-md">
                        <div>
                          <p className="text-sm font-medium">{standard.id}</p>
                          <p className="text-xs text-muted-foreground">{standard.description}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveStandard(standard.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  {filteredStandards().map(({ category, standards }) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="text-base">{category}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {standards.map((standard) => (
                            <div 
                              key={standard.id} 
                              className="flex items-start justify-between p-2 hover:bg-accent/20 rounded-md cursor-pointer"
                              onClick={() => handleStandardSelect(standard.id)}
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">{standard.id}</p>
                                <p className="text-xs text-muted-foreground">{standard.description}</p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="ml-2"
                                disabled={config.standards.some(std => std.id === standard.id)}
                              >
                                {config.standards.some(std => std.id === standard.id) ? 'Added' : 'Add'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </TabsContent>

          {/* Content Structure */}
          <TabsContent value="structure" className="space-y-6">
            <div>
              <Label className="text-base font-medium">Content Structure</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose how you want to organize your educational content:
              </p>
              
              <RadioGroup 
                value={contentStructure}
                onValueChange={setContentStructure}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {CONTENT_STRUCTURES.map((structure) => {
                  const Icon = structure.icon;
                  return (
                    <div key={structure.id} className="relative">
                      <RadioGroupItem
                        value={structure.id}
                        id={`structure-${structure.id}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`structure-${structure.id}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-medium">{structure.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {structure.description}
                          </p>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              
              <div className="mt-6">
                <h3 className="text-base font-medium mb-2">Structure Preview</h3>
                <div className="bg-accent/30 rounded-md p-4 h-48 flex items-center justify-center">
                  {contentStructure === "sequential" && (
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-md bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold">Topic 1</span>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                      <div className="w-16 h-16 rounded-md bg-primary/30 flex items-center justify-center">
                        <span className="text-sm font-bold">Topic 2</span>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                      <div className="w-16 h-16 rounded-md bg-primary/40 flex items-center justify-center">
                        <span className="text-sm font-bold">Topic 3</span>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                      <div className="w-16 h-16 rounded-md bg-primary/50 flex items-center justify-center">
                        <span className="text-sm font-bold">Topic 4</span>
                      </div>
                    </div>
                  )}
                  
                  {contentStructure === "hierarchical" && (
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-14 rounded-md bg-primary/60 flex items-center justify-center mb-4">
                        <span className="text-sm font-bold">Main Concept</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-12 rounded-md bg-primary/40 flex items-center justify-center">
                          <span className="text-xs font-medium">Subtopic 1</span>
                        </div>
                        <div className="w-20 h-12 rounded-md bg-primary/40 flex items-center justify-center">
                          <span className="text-xs font-medium">Subtopic 2</span>
                        </div>
                        <div className="w-20 h-12 rounded-md bg-primary/40 flex items-center justify-center">
                          <span className="text-xs font-medium">Subtopic 3</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {contentStructure === "modular" && (
                    <div className="grid grid-cols-3 grid-rows-2 gap-3">
                      <div className="w-20 h-16 rounded-md bg-primary/30 flex items-center justify-center">
                        <span className="text-xs font-medium">Module 1</span>
                      </div>
                      <div className="w-20 h-16 rounded-md bg-primary/30 flex items-center justify-center">
                        <span className="text-xs font-medium">Module 2</span>
                      </div>
                      <div className="w-20 h-16 rounded-md bg-primary/30 flex items-center justify-center">
                        <span className="text-xs font-medium">Module 3</span>
                      </div>
                      <div className="w-20 h-16 rounded-md bg-primary/30 flex items-center justify-center">
                        <span className="text-xs font-medium">Module 4</span>
                      </div>
                      <div className="w-20 h-16 rounded-md bg-primary/30 flex items-center justify-center">
                        <span className="text-xs font-medium">Module 5</span>
                      </div>
                      <div className="w-20 h-16 rounded-md bg-primary/30 flex items-center justify-center">
                        <span className="text-xs font-medium">Module 6</span>
                      </div>
                    </div>
                  )}
                  
                  {contentStructure === "spiral" && (
                    <div className="relative w-64 h-64">
                      <div className="absolute top-28 left-28 w-10 h-10 rounded-full bg-primary/60 flex items-center justify-center">
                        <span className="text-xs font-bold">Core</span>
                      </div>
                      <div className="absolute top-24 left-16 w-10 h-10 rounded-full bg-primary/40 flex items-center justify-center">
                        <span className="text-xs">Rev 1</span>
                      </div>
                      <div className="absolute top-12 left-14 w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
                        <span className="text-xs">Rev 2</span>
                      </div>
                      <div className="absolute top-6 left-24 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs">Rev 3</span>
                      </div>
                      <svg viewBox="0 0 100 100" width="100%" height="100%" className="absolute top-0 left-0">
                        <path d="M 50,50 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Accessibility */}
          <TabsContent value="accessibility" className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-2 block">Accessibility Features</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select the accessibility features to incorporate into your content:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="screen_reader_friendly"
                    checked={config.accessibility.includes("screen_reader_friendly")}
                    onCheckedChange={(checked) => 
                      handleAccessibilityChange("screen_reader_friendly", checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="screen_reader_friendly"
                      className="font-medium"
                    >
                      Screen Reader Friendly
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Optimize content for screen readers and provide text alternatives
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="simplified_language"
                    checked={config.accessibility.includes("simplified_language")}
                    onCheckedChange={(checked) => 
                      handleAccessibilityChange("simplified_language", checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="simplified_language"
                      className="font-medium"
                    >
                      Simplified Language
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use clearer and more straightforward language
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="high_contrast"
                    checked={config.accessibility.includes("high_contrast")}
                    onCheckedChange={(checked) => 
                      handleAccessibilityChange("high_contrast", checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="high_contrast"
                      className="font-medium"
                    >
                      High Contrast
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Ensure high contrast ratios between text and backgrounds
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="alternative_text"
                    checked={config.accessibility.includes("alternative_text")}
                    onCheckedChange={(checked) => 
                      handleAccessibilityChange("alternative_text", checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="alternative_text"
                      className="font-medium"
                    >
                      Alternative Text
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Include descriptive text for images and visual elements
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="closed_captioning"
                    checked={config.accessibility.includes("closed_captioning")}
                    onCheckedChange={(checked) => 
                      handleAccessibilityChange("closed_captioning", checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="closed_captioning"
                      className="font-medium"
                    >
                      Closed Captioning
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Provide captions for video content and audio materials
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="multi_sensory"
                    checked={config.accessibility.includes("multi_sensory")}
                    onCheckedChange={(checked) => 
                      handleAccessibilityChange("multi_sensory", checked === true)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="multi_sensory"
                      className="font-medium"
                    >
                      Multi-Sensory
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Include multiple ways to engage with the material
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-base font-medium mb-2">Language Sample</h3>
                <div className="bg-accent/30 rounded-md p-4">
                  <p className="text-sm font-medium">Sample with current settings:</p>
                  <div className="mt-2 p-3 bg-background rounded border">
                    {config.accessibility.includes("simplified_language") ? (
                      <p className="text-sm">
                        We will learn about fractions today. Fractions are parts of a whole. We use fractions when we split things into equal parts.
                      </p>
                    ) : (
                      <p className="text-sm">
                        Today we will explore the conceptual foundations of fractions as representations of part-to-whole relationships and examine their applications within real-world quantitative scenarios.
                      </p>
                    )}
                    
                    {config.accessibility.includes("alternative_text") && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        [Image: A circular pizza divided into 8 equal slices, with 3 slices highlighted to demonstrate the fraction 3/8]
                      </p>
                    )}
                    
                    {config.accessibility.includes("closed_captioning") && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        [Video caption: The teacher points to different parts of the fraction diagram, explaining the numerator and denominator]
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Review & Create */}
          <TabsContent value="review" className="space-y-6">
            <div>
              <h3 className="text-base font-medium mb-2">Project Summary</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div>
                    <p className="text-sm font-medium">Project Name:</p>
                    <p className="text-sm">{config.name || "Untitled Project"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Subject:</p>
                    <p className="text-sm">{config.subject.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Grade Level:</p>
                    <p className="text-sm">{config.gradeLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pedagogical Approach:</p>
                    <p className="text-sm">{config.pedagogicalApproach.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assessment Type:</p>
                    <p className="text-sm">{config.assessmentType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration:</p>
                    <p className="text-sm">{config.duration.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cultural Context:</p>
                    <p className="text-sm">{config.culturalContext.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Content Structure:</p>
                    <p className="text-sm">{contentStructure}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-sm">{config.description || "No description provided"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Learning Objectives ({config.learningObjectives.length}):</p>
                  {config.learningObjectives.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No learning objectives defined</p>
                  ) : (
                    <ul className="text-sm ml-4 list-disc">
                      {config.learningObjectives.map((obj, index) => (
                        <li key={index}>{obj}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium">Educational Standards ({config.standards.length}):</p>
                  {config.standards.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No standards selected</p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {config.standards.map((standard, index) => (
                        <li key={index}>
                          <span className="font-medium">{standard.id}</span>: {standard.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium">Accessibility Features ({config.accessibility.length}):</p>
                  {config.accessibility.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No accessibility features selected</p>
                  ) : (
                    <ul className="text-sm ml-4 list-disc">
                      {config.accessibility.map((feature, index) => (
                        <li key={index}>{feature.replace('_', ' ')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-accent/20 rounded-md border border-primary/20">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">AI-Generated Content Ready</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your project configuration is complete and ready for AI content generation. This configuration will be used to create educational content tailored to your specific requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          {currentStep !== "basics" && (
            <Button variant="outline" onClick={prevStep}>
              Previous Step
            </Button>
          )}
        </div>
        <div>
          {currentStep !== "review" ? (
            <Button onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Create Project
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default ProjectConfigWizard;
