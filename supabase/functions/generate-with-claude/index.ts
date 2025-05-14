
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Get API key from environment variable
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting state
const rateLimits = {
  requests: new Map<string, number[]>(), // clientKey -> timestamp[]
  maxRequests: 5, // Maximum requests per window
  windowMs: 60000, // Window size in milliseconds (1 minute)
};

// Check if a request should be rate limited
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientRequests = rateLimits.requests.get(clientId) || [];
  
  // Filter out requests older than our window
  const recentRequests = clientRequests.filter(timestamp => now - timestamp < rateLimits.windowMs);
  
  // Update request list
  rateLimits.requests.set(clientId, [...recentRequests, now]);
  
  // Check if we've exceeded the limit
  return recentRequests.length < rateLimits.maxRequests;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = req.headers.get('x-client-info') || req.headers.get('user-agent') || 'anonymous';
    const { prompt, model = 'claude-3-haiku', projectConfig, structureType, referenceUrls = [] } = await req.json();

    // Check rate limits
    if (!checkRateLimit(clientId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in environment variables' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract references for context
    const referenceContext = referenceUrls.length > 0 
      ? `Consider these reference URLs in your outline creation:\n${referenceUrls.join('\n')}\n\n`
      : '';

    // Create a system prompt that guides Claude to generate educational content
    const systemPrompt = `You are an expert educational content outline generator. 
Your task is to create a detailed, well-structured outline for educational content.

${referenceContext}

Follow these guidelines:
- Structure the content in a ${structureType || 'sequential'} format
- Match the outline to the grade level: ${projectConfig?.gradeLevel || 'unspecified'}
- Align with subject area: ${projectConfig?.subject || 'unspecified'}
- Include learning objectives that address the standards provided
- Create appropriate assessment points
- Estimate realistic word counts and durations for each section
- Maintain consistent educational taxonomy levels
- Return the response in valid JSON format as an array of OutlineNode objects

The outline should be comprehensive yet clear, with logical progression through concepts.`;

    console.log("Calling Anthropic Claude API with model:", model);

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
      console.error("Anthropic API error:", data);
      
      // Handle different error types
      let status = 500;
      let errorMessage = "Error calling Anthropic API";
      
      if (data?.error?.type === "authentication_error") {
        status = 401;
        errorMessage = "Authentication error with Anthropic API";
      } else if (data?.error?.type === "rate_limit_error") {
        status = 429;
        errorMessage = "Rate limit exceeded for Anthropic API";
      } else if (data?.error?.type === "invalid_request_error") {
        status = 400;
        errorMessage = data?.error?.message || "Invalid request to Anthropic API";
      }
      
      throw new Error(`Anthropic API error: ${errorMessage}`);
    }

    // Process and return the generated content
    const generatedOutline = data.content?.[0]?.text || "[]";
    
    // Do basic validation of the response to ensure it's properly formed
    try {
      // Just check if it's valid JSON, don't need to store the result
      JSON.parse(generatedOutline);
    } catch (e) {
      console.warn("Claude didn't return valid JSON. Raw response:", generatedOutline.substring(0, 200) + "...");
    }
    
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
    
    // Determine appropriate status code
    let status = 500;
    let errorMessage = error.message || "Unknown error";
    
    if (errorMessage.includes("authentication")) {
      status = 401; 
    } else if (errorMessage.includes("rate limit")) {
      status = 429;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
