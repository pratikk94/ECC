# Educational Content Generator

A Next.js application that generates educational content and assessment questions using OpenAI.

## Features

- Generate educational content on any topic and subtopic
- Create three types of assessment questions:
  - Single-choice questions
  - Multiple-choice questions
  - Matching pairs questions
- Adjust difficulty level (easy, medium, hard)
- Customize number of questions
- Download content and questions as PDF

## Technologies Used

- Next.js 15
- TypeScript
- Tailwind CSS
- OpenAI API
- html2pdf.js

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. Enter a topic and subtopic, then click "Generate Content"
2. Once content is generated, go to the "Question Generator" tab
3. Select question type, difficulty level, and number of questions
4. Click "Generate Questions" to create assessment questions
5. Preview the content and questions in the "Preview & Download" tab
6. Click "Download as PDF" to save the generated content and questions

## License

MIT
