
import { EducationalStandard } from "@/types/project";

// This is a sample of educational standards that would be expanded in a real application
export const standardsDatabase: EducationalStandard[] = [
  // Common Core Math Standards
  {
    id: "CCSS.Math.Content.K.CC.A.1",
    description: "Count to 100 by ones and by tens.",
    organization: "Common Core",
    category: "Math"
  },
  {
    id: "CCSS.Math.Content.1.OA.A.1",
    description: "Use addition and subtraction within 20 to solve word problems.",
    organization: "Common Core",
    category: "Math"
  },
  {
    id: "CCSS.Math.Content.2.NBT.A.1",
    description: "Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones.",
    organization: "Common Core",
    category: "Math"
  },
  {
    id: "CCSS.Math.Content.3.NF.A.1",
    description: "Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts.",
    organization: "Common Core",
    category: "Math"
  },
  {
    id: "CCSS.Math.Content.4.MD.A.1",
    description: "Know relative sizes of measurement units within one system of units.",
    organization: "Common Core",
    category: "Math"
  },
  {
    id: "CCSS.Math.Content.5.G.A.1",
    description: "Use a pair of perpendicular number lines, called axes, to define a coordinate system.",
    organization: "Common Core",
    category: "Math"
  },
  {
    id: "CCSS.Math.Content.6.RP.A.1",
    description: "Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.",
    organization: "Common Core",
    category: "Math"
  },
  
  // Common Core ELA Standards
  {
    id: "CCSS.ELA-Literacy.RL.K.1",
    description: "With prompting and support, ask and answer questions about key details in a text.",
    organization: "Common Core",
    category: "ELA"
  },
  {
    id: "CCSS.ELA-Literacy.RL.1.1",
    description: "Ask and answer questions about key details in a text.",
    organization: "Common Core",
    category: "ELA"
  },
  {
    id: "CCSS.ELA-Literacy.RI.2.1",
    description: "Ask and answer such questions as who, what, where, when, why, and how to demonstrate understanding of key details in a text.",
    organization: "Common Core",
    category: "ELA"
  },
  {
    id: "CCSS.ELA-Literacy.RI.3.1",
    description: "Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers.",
    organization: "Common Core",
    category: "ELA"
  },
  {
    id: "CCSS.ELA-Literacy.RL.4.1",
    description: "Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text.",
    organization: "Common Core",
    category: "ELA"
  },
  {
    id: "CCSS.ELA-Literacy.RL.5.1",
    description: "Quote accurately from a text when explaining what the text says explicitly and when drawing inferences from the text.",
    organization: "Common Core",
    category: "ELA"
  },
  
  // Next Generation Science Standards
  {
    id: "NGSS.K-PS2-1",
    description: "Plan and conduct an investigation to compare the effects of different strengths or different directions of pushes and pulls on the motion of an object.",
    organization: "NGSS",
    category: "Science"
  },
  {
    id: "NGSS.1-PS4-1",
    description: "Plan and conduct investigations to provide evidence that vibrating materials can make sound and that sound can make materials vibrate.",
    organization: "NGSS",
    category: "Science"
  },
  {
    id: "NGSS.2-LS2-1",
    description: "Plan and conduct an investigation to determine if plants need sunlight and water to grow.",
    organization: "NGSS",
    category: "Science"
  },
  {
    id: "NGSS.3-PS2-1",
    description: "Plan and conduct an investigation to provide evidence of the effects of balanced and unbalanced forces on the motion of an object.",
    organization: "NGSS",
    category: "Science"
  },
  {
    id: "NGSS.4-PS3-2",
    description: "Make observations to provide evidence that energy can be transferred from place to place by sound, light, heat, and electric currents.",
    organization: "NGSS",
    category: "Science"
  },
  {
    id: "NGSS.5-PS1-1",
    description: "Develop a model to describe that matter is made of particles too small to be seen.",
    organization: "NGSS",
    category: "Science"
  },
  {
    id: "NGSS.MS-PS1-1",
    description: "Develop models to describe the atomic composition of simple molecules and extended structures.",
    organization: "NGSS",
    category: "Science"
  }
];

export default standardsDatabase;
