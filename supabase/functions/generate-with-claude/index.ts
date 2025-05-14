
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Get API key from environment variable
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model = 'claude-3-haiku', projectConfig, structureType } = await req.json();

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in environment variables' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a system prompt that guides Claude to generate educational content
    const systemPrompt = `You are an expert educational content outline generator. 
Your task is to create a detailed, well-structured outline for educational content.
Follow these guidelines:
- Structure the content in a ${structureType || 'sequential'} format
- Match the outline to the grade level: ${projectConfig.gradeLevel || 'unspecified'}
- Align with subject area: ${projectConfig.subject || 'unspecified'}
- Include learning objectives that address the standards provided
- Create appropriate assessment points
- Estimate realistic word counts and durations for each section
- Maintain consistent educational taxonomy levels
- Return the response in valid JSON format that matches the OutlineNode interface

The outline should be comprehensive yet clear, with logical progression through concepts.`;

    // Make API call to Anthropic Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    // Get response data
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${JSON.stringify(data)}`);
    }

    // Process and return the generated content
    const generatedOutline = data.content?.[0]?.text || "{}";
    
    return new Response(
      JSON.stringify({
        success: true,
        model: model,
        outline: generatedOutline,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in generate-with-claude function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
