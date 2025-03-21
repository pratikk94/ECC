import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ContentAnalytics } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Calculate basic metrics without AI
    const wordCount = content.trim().split(/\s+/).length;
    
    // Average adult reading speed is ~250 words per minute
    const estimatedReadingTimeMinutes = Math.ceil(wordCount / 250);
    
    // Extract key terms and perform deeper analysis with AI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an educational content analyzer. Analyze the provided content and return JSON with readability statistics and key terms."
        },
        {
          role: "user",
          content: `Analyze the following educational content and return a JSON object with:
          1. A Flesch-Kincaid readability score (0-100 scale)
          2. List of 5-10 key terms/concepts with their importance (1-10 scale)
          3. An assessment of complexity level (beginner, intermediate, or advanced)
          4. A topic relevance score (0-100 scale) that indicates how focused the content is on its main topic
          5. A list of suggested tags for categorizing this content
          
          Content to analyze:
          ${content}
          
          Return ONLY a valid JSON object without any explanation or commentary.`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the AI response
    const aiAnalysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Combine basic metrics with AI analysis
    const analytics: ContentAnalytics = {
      readabilityScore: aiAnalysis.readabilityScore || 50,
      wordCount,
      estimatedReadingTimeMinutes,
      topicRelevanceScore: aiAnalysis.topicRelevanceScore,
      keyTerms: aiAnalysis.keyTerms?.map((term: any) => term.term) || [],
      complexityLevel: aiAnalysis.complexityLevel || 'intermediate',
      suggestedTags: aiAnalysis.suggestedTags || []
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
} 