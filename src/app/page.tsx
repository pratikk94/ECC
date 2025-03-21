import ContentGenerator from '@/components/ContentGenerator';
import DarkModeToggle from '@/components/DarkModeToggle';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <DarkModeToggle />
      
      <div className="header">
        <div className="header-logo">
          <div className="logo-container">
            <span className="logo-text large">DestinPQ</span>
            <span className="logo-tagline">AI-Powered Learning Solutions</span>
          </div>
        </div>
        <h1>Educational Content Generator</h1>
        <p>Create professional content and assessments for any educational topic using AI</p>
        <div className="header-highlight">
          Transform learning experiences with personalized content
        </div>
        <div className="header-links">
          <Link href="/course-modules" className="header-link">
            Build Course Modules ➔
          </Link>
        </div>
      </div>
      
      <ContentGenerator />
      
      <footer>
        <p>© {new Date().getFullYear()} DestinPQ Educational Content Generator</p>
        <p>A powerful tool for educators and content creators</p>
      </footer>
    </div>
  );
}
