import { LanguageConfig, CulturalContext, TerminologyType } from '@/types/project';
import { claudeService } from '@/services/claudeService';

// This service provides functions to generate language samples based on configuration
interface SampleGenerationOptions {
  topic?: string;
  maxLength?: number;
}

export const generateLanguageSample = async (
  config: LanguageConfig, 
  options: SampleGenerationOptions = {}
): Promise<string> => {
  try {
    const { topic = "science", maxLength = 300 } = options;
    const { readabilityLevel, culturalContext, terminology } = config;
    
    // Create a prompt for Claude to generate a language sample
    const prompt = `
    Generate a sample paragraph about ${topic} with these characteristics:
    
    - Readability level: ${readabilityLevel}/10 (where 1 is elementary and 10 is post-graduate)
    - Cultural context: ${culturalContext}
    - Terminology type: ${terminology}
    
    The sample should be approximately ${maxLength} characters long.
    
    Return just the paragraph with no additional explanation.
    `;

    // Call Claude API via the claude service
    const { data, error } = await claudeService.generateContent({
      prompt,
      model: 'claude-3-haiku', // Updated to use claude-3-haiku
      format: 'text',
      temperature: 0.7,
      maxTokens: 500
    });

    if (error) {
      console.error("Error generating language sample:", error);
      return generateFallbackSample(config, options);
    }

    if (typeof data === 'string') {
      return data.substring(0, maxLength);
    } else {
      console.error("Unexpected response format from AI service");
      return generateFallbackSample(config, options);
    }
  } catch (err) {
    console.error('Failed to generate language sample with AI:', err);
    // Fall back to the local function
    return generateFallbackSample(config, options);
  }
};

// Fallback function for when the AI call fails
const generateFallbackSample = (config: LanguageConfig, options: SampleGenerationOptions): string => {
  const { readabilityLevel, culturalContext, terminology } = config;
  const { topic = "science", maxLength = 300 } = options;
  
  // Base samples for different readability levels
  const readabilitySamples: Record<number, string> = {
    1: "The sun is big. It gives us light. Plants need light to grow. We need plants.",
    2: "The sun is very big. It gives light to Earth. Plants use this light to grow. People and animals eat plants.",
    3: "The sun is a star. It is very hot. It gives light and heat to Earth. Plants use sunlight to make food. This is called photosynthesis.",
    4: "The sun is the star at the center of our solar system. It provides the light and heat that make life possible on Earth. Plants capture the sun's energy through a process called photosynthesis.",
    5: "The sun is the star at the center of our solar system that provides the energy that sustains life on Earth. Through photosynthesis, plants convert sunlight into chemical energy that powers the food web.",
    6: "The sun, a G-type main-sequence star, is the celestial body at the center of our solar system. It emits the electromagnetic radiation that enables photosynthesis in plants, forming the foundation of most terrestrial ecosystems.",
    7: "The sun, a G-type main-sequence star comprising about 99.86% of the Solar System's mass, emits electromagnetic radiation that facilitates photosynthesis in plants, establishing the fundamental energy pathway for almost all terrestrial ecosystems.",
    8: "The sun, a G-type main-sequence star constituting approximately 99.86% of the Solar System's total mass, emits electromagnetic radiation across the spectrum, facilitating photosynthetic processes in plants that establish the foundational energy pathway for virtually all Earth's ecosystems.",
    9: "The sun, a G-type main-sequence star (G2V) constituting approximately 99.86% of the Solar System's total mass, emits electromagnetic radiation across the spectrum, facilitating photosynthetic processes in chloroplast-containing organisms that establish the foundational energy pathway for virtually all Earth's ecosystems.",
    10: "The sun, a G-type main-sequence star (G2V) constituting approximately 99.86% of the Solar System's total mass, emits electromagnetic radiation across the spectrum, facilitating complex photosynthetic processes in chloroplast-containing organisms that establish the foundational energy pathway for virtually all Earth's ecosystems and biogeochemical cycles."
  };
  
  // Get base sample for readability level (or closest available)
  let closestLevel = 5; // default
  const availableLevels = Object.keys(readabilitySamples).map(Number);
  const distances = availableLevels.map(level => Math.abs(level - readabilityLevel));
  const minDistance = Math.min(...distances);
  closestLevel = availableLevels[distances.indexOf(minDistance)];
  
  let sample = readabilitySamples[closestLevel];
  
  // Modify based on terminology level
  if (terminology === 'academic') {
    sample += " The pedagogical implications include utilizing solar phenomena to illustrate fundamental scientific principles and energy transfer mechanisms.";
  } else if (terminology === 'simple') {
    // Simplify some terms if the sample is complex but terminology should be simple
    if (readabilityLevel > 5) {
      sample = sample
        .replace('electromagnetic radiation', 'light and heat')
        .replace('constituting approximately', 'making up about')
        .replace('facilitating', 'helping')
        .replace('photosynthetic processes', 'the way plants make food');
    }
  }
  
  // Add cultural context
  if (culturalContext === 'multicultural') {
    sample += " Various cultures throughout history have interpreted the significance of the sun differently, often incorporating it into their mythologies, agricultural practices, and belief systems.";
  } else if (culturalContext === 'indigenous') {
    sample += " Many Indigenous cultures have deep connections to the sun, viewing it as a life-giving force with spiritual significance that guides planting cycles and cultural practices.";
  } else if (culturalContext === 'culturally_responsive') {
    sample += " Understanding how different communities relate to and depend on the sun can help create learning experiences that honor diverse perspectives and traditional ecological knowledge.";
  } else if (culturalContext === 'global') {
    sample += " Globally, societies have developed various technologies to harness solar energy, from traditional architecture to modern photovoltaic cells, reflecting different approaches to sustainability.";
  }
  
  // Trim if needed
  if (sample.length > maxLength) {
    sample = sample.substring(0, maxLength) + "...";
  }
  
  return sample;
};
