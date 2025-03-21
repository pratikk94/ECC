import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic, subtopic } = await req.json();
    
    if (!topic || !subtopic) {
      return NextResponse.json(
        { error: 'Topic and subtopic are required' },
        { status: 400 }
      );
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert educational content creator with deep knowledge across various subjects. Your task is to create comprehensive, accurate, and engaging educational content. Focus on clarity, proper structure, and educational value while making complex concepts accessible to students.`
        },
        {
          role: "user",
          content: `Create an educational content piece about "${topic}", specifically focusing on "${subtopic}".

CONTENT STRUCTURE:
1. Introduction (approximately 75 words)
   - Begin with a compelling hook related to ${subtopic}
   - Provide brief context about ${topic} and why ${subtopic} is important
   - Include a clear thesis statement outlining what the reader will learn

2. Background/Historical Context (approximately 100 words)
   - Provide necessary historical background on ${subtopic}
   - Explain how ${subtopic} fits within the broader field of ${topic}
   - Mention key figures, events, or developments if relevant

3. Main Concepts/Core Principles (approximately 150 words)
   - Clearly define all essential terminology related to ${subtopic}
   - Explain 3-5 fundamental concepts or principles of ${subtopic}
   - Use simple language while maintaining academic accuracy

4. Practical Applications/Examples (approximately 100 words)
   - Provide specific real-world examples demonstrating ${subtopic} in action
   - Include practical applications of the concepts
   - If appropriate, mention how ${subtopic} affects everyday life

5. Current Developments/Challenges (approximately 75 words)
   - Discuss recent developments in ${subtopic}
   - Address current challenges or controversies
   - Mention ongoing research or evolving understanding

6. Conclusion (approximately 75 words)
   - Summarize key points about ${subtopic}
   - Reinforce the importance of ${subtopic} within ${topic}
   - End with a thought-provoking question or forward-looking statement

CONTENT GUIDELINES:
- Write in clear, concise educational prose suitable for students
- Maintain a neutral, objective tone while being engaging
- Ensure factual accuracy and educational value
- Use paragraph breaks appropriately for readability
- Avoid jargon unless necessary (then explain it)
- Total length should be approximately 575 words
- Structure content with appropriate headings for each section

This content will be used for educational purposes, so accuracy, clarity, and educational value are the top priorities.`
        }
      ],
    });

    return NextResponse.json({ content: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 