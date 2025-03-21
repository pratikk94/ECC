import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content, questionType, difficulty, numQuestions, includeExplanations, includeTags, timeEstimates } = await req.json();
    
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
      case 'trueFalse':
        promptForQuestionType = 'Create true/false questions where the statement is either entirely true or contains a significant factual error.';
        questionStructureGuidelines = `
        For true/false questions:
        - Create clear, unambiguous statements
        - Avoid qualifiers like "always," "never," "all," "none" in false statements
        - For false statements, make sure they contain a clear factual error
        - Balance the number of true and false statements
        - Statements should be concise and test one concept at a time`;
        break;
      case 'fillInBlank':
        promptForQuestionType = 'Create fill-in-the-blank questions where key terms or concepts are removed and must be filled in.';
        questionStructureGuidelines = `
        For fill-in-the-blank questions:
        - Remove key terms or concepts that are central to understanding
        - Each blank should have 1-3 acceptable answers
        - The blanks should be challenging but answerable from the content
        - Provide clear context in the surrounding text
        - The sentence structure should clearly indicate what type of word/phrase is missing`;
        break;
      case 'essay':
        promptForQuestionType = 'Create essay prompts that require analytical thinking and synthesis of information from the content.';
        questionStructureGuidelines = `
        For essay questions:
        - Create prompts that require analysis, evaluation, or synthesis
        - Specify a reasonable word limit for the response
        - Include guidance on what aspects to address
        - Create a scoring rubric with 3-4 criteria and descriptions of performance levels
        - Optionally provide a brief sample answer outline`;
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
    
    const additionalInstructions = [];
    
    if (includeExplanations) {
      additionalInstructions.push(`
      - For each question, provide a brief explanation of why the correct answer is correct
      - Explanations should be clear, concise, and educational
      - For incorrect options, briefly explain why they are incorrect where appropriate`);
    }
    
    if (includeTags) {
      additionalInstructions.push(`
      - Add 2-4 relevant tags for each question that indicate the specific concepts being tested
      - Tags should be concise (1-3 words) and useful for categorization`);
    }
    
    if (timeEstimates) {
      additionalInstructions.push(`
      - For each question, estimate the approximate time in seconds a student would need to answer
      - Base this on question complexity and required cognitive processing
      - Simple recall questions might take 30 seconds, while complex analysis might take 120 seconds or more`);
    }
    
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

${additionalInstructions.join('\n')}

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
      "id": "unique-id",
      "type": "singleChoice",
      "question": "Complete question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option that is correct",
      "explanation": "Explanation of the correct answer (if requested)",
      "tags": ["tag1", "tag2"] (if requested),
      "estimatedTimeSeconds": 45 (if requested),
      "difficulty": "${difficulty}"
    },
    ... additional questions
  ]
}

For multiple choice:
{
  "questions": [
    {
      "id": "unique-id",
      "type": "multipleChoice",
      "question": "Complete question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswers": ["First correct option", "Second correct option"],
      "explanation": "Explanation of the correct answer (if requested)",
      "tags": ["tag1", "tag2"] (if requested),
      "estimatedTimeSeconds": 60 (if requested),
      "difficulty": "${difficulty}"
    },
    ... additional questions
  ]
}

For matching pairs:
{
  "questions": [
    {
      "id": "unique-id",
      "type": "matchingPairs",
      "question": "Match the items in Column A with their corresponding items in Column B",
      "columnA": ["Item 1", "Item 2", "Item 3", "Item 4"],
      "columnB": ["Match 1", "Match 2", "Match 3", "Match 4"],
      "correctPairs": [[0, 0], [1, 1], [2, 2], [3, 3]],
      "explanation": "Explanation of the matches (if requested)",
      "tags": ["tag1", "tag2"] (if requested),
      "estimatedTimeSeconds": 90 (if requested),
      "difficulty": "${difficulty}"
    }
  ]
}

For true/false:
{
  "questions": [
    {
      "id": "unique-id",
      "type": "trueFalse",
      "question": "Question prompt",
      "statement": "Statement to evaluate as true or false",
      "isTrue": true or false,
      "explanation": "Explanation of why the statement is true or false (if requested)",
      "tags": ["tag1", "tag2"] (if requested),
      "estimatedTimeSeconds": 30 (if requested),
      "difficulty": "${difficulty}"
    },
    ... additional questions
  ]
}

For fill in blank:
{
  "questions": [
    {
      "id": "unique-id",
      "type": "fillInBlank",
      "question": "Fill in the blanks in the following text",
      "textWithBlanks": "Text with _____ for blanks",
      "answers": [["acceptable answer 1", "alternative answer 1"], ["acceptable answer 2"]],
      "explanation": "Explanation of the answers (if requested)",
      "tags": ["tag1", "tag2"] (if requested),
      "estimatedTimeSeconds": 45 (if requested),
      "difficulty": "${difficulty}"
    },
    ... additional questions
  ]
}

For essay:
{
  "questions": [
    {
      "id": "unique-id",
      "type": "essay",
      "question": "Essay question prompt",
      "prompt": "Detailed prompt with guidance",
      "wordLimit": 500,
      "rubric": [
        {
          "criteria": "Understanding of Content",
          "weight": 30,
          "descriptions": {
            "excellent": "Demonstrates thorough understanding...",
            "good": "Shows good understanding...",
            "satisfactory": "Basic understanding shown...",
            "needsImprovement": "Limited understanding..."
          }
        },
        ... additional rubric items
      ],
      "sampleAnswer": "Brief outline of a good response (if requested)",
      "tags": ["tag1", "tag2"] (if requested),
      "estimatedTimeSeconds": 1200 (if requested),
      "difficulty": "${difficulty}"
    },
    ... additional questions
  ]
}

Ensure the JSON is valid and properly formatted.`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response into JSON
    const questionsJSON = JSON.parse(completion.choices[0].message.content || '{"questions": []}');
    
    // Assign UUIDs if they weren't generated by the AI
    if (questionsJSON && questionsJSON.questions) {
      questionsJSON.questions.forEach((q: Record<string, unknown>) => {
        if (!q.id) {
          q.id = uuidv4();
        }
      });
    }
    
    return NextResponse.json(questionsJSON);
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
} 