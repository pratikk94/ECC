import ContentGenerator from '@/components/ContentGenerator';

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <h1>Educational Content Generator</h1>
        <p>Create professional content and assessments for any educational topic using AI</p>
      </div>
      
      <ContentGenerator />
      
      <footer>
        <p>Powered by OpenAI GPT models</p>
      </footer>
    </div>
  );
}
