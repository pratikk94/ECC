import ContentGenerator from '@/components/ContentGenerator';

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <div className="header-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.25 15.25V5.75C19.25 5.19772 18.8023 4.75 18.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V16.75C4.75 17.8546 5.64543 18.75 6.75 18.75H18.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 8.75H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 11.75H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 14.75H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>Educational Content Generator</h1>
        <p>Create professional content and assessments for any educational topic using AI</p>
        <div className="header-highlight">
          Powered by OpenAI GPT models
        </div>
      </div>
      
      <ContentGenerator />
      
      <footer>
        <p>© {new Date().getFullYear()} Educational Content Generator</p>
        <p>A powerful tool for educators and content creators</p>
      </footer>
    </div>
  );
}
