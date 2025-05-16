
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

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
    // Get the request body
    const body = await req.json();
    const { 
      prompt, 
      model = 'claude-3-sonnet', // Changed default from claude-3-haiku to claude-3-sonnet
      projectConfig = null, 
      format = null,
      temperature = 0.7,
      maxTokens = 1000 
    } = body;

    console.log(`Generating content with ${model}`);
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Missing Anthropic API key');
    }

    if (!prompt) {
      throw new Error('Missing prompt');
    }

    // Configure the Claude API request
    let messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    // Define system message based on the request type
    let systemPrompt = "You are an AI teaching assistant that helps educators create high-quality educational content.";
    
    // Add specialized instructions based on the format
    if (format === 'json') {
      systemPrompt += " Respond using valid JSON format only, with no explanations or other text outside the JSON.";
    }

    if (projectConfig) {
      systemPrompt += ` You're helping with a ${projectConfig.type} for ${projectConfig.gradeLevel} on the subject of ${projectConfig.subject}.`;
    }

    // Make the API request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt,
        messages: messages
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.content[0].text;
    
    console.log(`Generation complete. Content starts with: ${generatedContent.substring(0, 50)}...`);
    
    // Try to parse JSON if that's what we're expecting
    if (format === 'json') {
      try {
        // Find JSON in the response
        const jsonMatch = generatedContent.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonContent = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({ content: jsonContent }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (jsonError) {
        console.error('Failed to parse JSON from Claude response:', jsonError);
        // Fall back to sending raw text
      }
    }
    
    // Return the generated content
    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-with-claude function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
