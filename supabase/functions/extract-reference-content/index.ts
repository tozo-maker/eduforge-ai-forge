
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
    const { reference } = await req.json();

    // Validate the reference
    if (!reference || !reference.url) {
      return new Response(
        JSON.stringify({ error: 'Reference URL is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if API key is available
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in environment variables' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Attempt to fetch the content from the URL
    let pageContent;
    try {
      const fetchResponse = await fetch(reference.url);
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch URL: ${fetchResponse.status}`);
      }
      
      const contentType = fetchResponse.headers.get('Content-Type') || '';
      
      // Only process HTML content
      if (contentType.includes('text/html')) {
        pageContent = await fetchResponse.text();
      } else {
        pageContent = `[Content type ${contentType} - Direct extraction not supported]`;
      }
    } catch (fetchError) {
      console.error('Error fetching URL:', fetchError);
      pageContent = '[Could not fetch content from URL]';
    }

    // Use Claude to analyze the content
    const prompt = `Extract the key information from this reference material:
    
Title: ${reference.title || 'Untitled'}
URL: ${reference.url}
Type: ${reference.type || 'Unknown'}
Notes: ${reference.notes || 'None'}
    
${pageContent ? 'Page content (partial): ' + pageContent.substring(0, 5000) : 'No content could be extracted'}

Please provide:
1. A brief summary of the main content (100 words max)
2. A list of 5-10 key terms or concepts from this material
3. How this reference could be useful for educational content`;

    // Make API call to Anthropic Claude for content analysis
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    // Get response data
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${JSON.stringify(data)}`);
    }

    const analysisText = data.content?.[0]?.text || "";
    
    // Extract key components from the analysis
    const summary = extractSection(analysisText, 'summary') || 
                    extractSection(analysisText, 'brief summary') || 
                    "No summary available";
    
    const keyTermsText = extractSection(analysisText, 'key terms') || 
                         extractSection(analysisText, 'key concepts') || 
                         "";
    
    // Convert key terms text to array
    const keyTerms = keyTermsText
      .split(/\n|-|•/)
      .map(term => term.trim())
      .filter(term => term.length > 0 && !/^\d+\./.test(term));
    
    return new Response(
      JSON.stringify({
        success: true,
        content: pageContent?.substring(0, 1000) || "",
        summary: summary,
        keyTerms: keyTerms
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in extract-reference-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to extract a section from the analysis text
function extractSection(text: string, sectionName: string): string {
  // Try different patterns to find the section
  const patterns = [
    new RegExp(`(?:${sectionName}|${sectionName.toUpperCase()})\\s*:?\\s*([^\\n]+(?:\\n(?!\\n|[A-Z0-9][\\s\\n]|\\d\\.)[^\\n]+)*)`, 'i'),
    new RegExp(`(?:${sectionName}|${sectionName.toUpperCase()})\\s*:\\s*([\\s\\S]*?)(?=\\n\\n|\\n[A-Z][^\\n]+:|$)`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return "";
}
