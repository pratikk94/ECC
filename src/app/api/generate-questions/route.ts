import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content, questionType, difficulty, numQuestions } = await req.json();
    
    if (!content || !questionType || !difficulty || !numQuestions) {
      return NextResponse.json(
        { error: 'Content, question type, difficulty level, and number of questions are required' },
        { status: 400 }
      );
    }
    
    let promptForQuestionType = '';
    let questionStructureGuidelines = '';
    
    switch (questionType) {
      case 'singleChoice':
        promptForQuestionType = 'Create single-choice multiple-choice questions with exactly 4 options each, with only one correct answer.';
        questionStructureGuidelines = `
        For single choice questions:
        - Each question should have a clear, unambiguous correct answer
        - The 3 incorrect options (distractors) should be plausible but clearly incorrect
        - Distractors should be of similar length and structure as the correct answer
        - Avoid using "all/none of the above" options
        - Ensure options are mutually exclusive
        - Make sure the correct answer is distributed randomly (don't always make it option A, B, etc.)`;
        break;
      case 'multipleChoice':
        promptForQuestionType = 'Create multiple-choice questions with exactly 4 options each, where 2-3 options are correct.';
        questionStructureGuidelines = `
        For multiple choice questions:
        - Each question should have 2-3 correct answers
        - All incorrect options should be plausible but clearly incorrect
        - Avoid having "all of the above" as an option
        - Ensure all options are relevant to the question
        - Make options similar in length and grammatical structure
        - The correct answers should test different aspects of the same concept`;
        break;
      case 'matchingPairs':
        promptForQuestionType = 'Create a matching pairs exercise with items in column A that correspond to items in column B.';
        questionStructureGuidelines = `
        For matching pairs:
        - Create ${numQuestions} items in Column A with their corresponding matches in Column B
        - Each item in Column A should have exactly one correct match in Column B
        - Items in both columns should be concise (1-5 words when possible)
        - Column A should contain concepts, terms, or principles
        - Column B should contain definitions, explanations, or examples
        - Items should be from the same category or topic area
        - Ensure there are no ambiguous matches`;
        break;
      default:
        promptForQuestionType = 'Create single-choice multiple-choice questions with 4 options each, with only one correct answer.';
        questionStructureGuidelines = `
        For single choice questions:
        - Each question should have a clear, unambiguous correct answer
        - The 3 incorrect options (distractors) should be plausible but clearly incorrect
        - Distractors should be of similar length and structure as the correct answer
        - Avoid using "all/none of the above" options
        - Ensure options are mutually exclusive`;
    }

    const difficultyGuidelines = {
      easy: `For easy difficulty:
        - Focus on recall and basic understanding
        - Use straightforward language
        - Test fundamental concepts and definitions
        - Questions should be answerable directly from the content
        - Avoid complex scenario-based questions`,
      
      medium: `For medium difficulty:
        - Test application and analysis of concepts
        - Include some questions requiring inference
        - Use more nuanced language
        - May require connecting multiple concepts
        - Include some scenario-based questions`,
      
      hard: `For hard difficulty:
        - Focus on evaluation and synthesis of information
        - Include complex scenarios requiring critical thinking
        - Test deeper understanding and relationships between concepts
        - Require application of concepts to novel situations
        - Include questions that test edge cases and exceptions`,
    };
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert educational assessment developer with experience creating high-quality questions that accurately measure understanding across various subjects and difficulty levels."
        },
        {
          role: "user",
          content: `Based on the following educational content, create ${numQuestions} high-quality ${difficulty} ${questionType} questions.

EDUCATIONAL CONTENT:
${content}

QUESTION TYPE:
${promptForQuestionType}

QUESTION GUIDELINES:
${questionStructureGuidelines}

DIFFICULTY LEVEL: ${difficulty}
${difficultyGuidelines[difficulty as keyof typeof difficultyGuidelines]}

GENERAL ASSESSMENT GUIDELINES:
- Questions should directly test understanding of the educational content provided
- Cover different aspects/sections of the content (don't focus on just one part)
- Ensure questions are clear, concise, and unambiguous
- Use proper grammar and professional language
- Questions should progressively test different cognitive levels (knowledge, comprehension, application, analysis)
- Avoid cultural bias or assuming specific regional knowledge
- Ensure all questions have definitive, factually correct answers
- Make sure distractors are plausible but clearly incorrect to a knowledgeable person

FORMAT THE OUTPUT AS A VALID JSON OBJECT with the structure appropriate for the question type:

For single choice:
{
  "questions": [
    {
      "question": "Complete question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option that is correct"
    },
    ... additional questions
  ]
}

For multiple choice:
{
  "questions": [
    {
      "question": "Complete question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswers": ["First correct option", "Second correct option"]
    },
    ... additional questions
  ]
}

For matching pairs:
{
  "questions": [
    {
      "columnA": ["Item 1", "Item 2", "Item 3", "Item 4"],
      "columnB": ["Match 1", "Match 2", "Match 3", "Match 4"],
      "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]]
    }
  ]
}

The array indices in correctPairs represent the position in columnA and columnB arrays (zero-indexed).
Ensure the JSON is valid and properly formatted.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const questionsJSON = JSON.parse(completion.choices[0].message.content || '{"questions": []}');
    return NextResponse.json(questionsJSON);
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 