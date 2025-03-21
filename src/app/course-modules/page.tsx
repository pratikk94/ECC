import CourseModule from '@/components/CourseModule';

export default function CourseModulesPage() {
  return (
    <div className="container">
      <div className="header">
        <div className="header-logo">
          <div className="logo-container">
            <span className="logo-text large">DestinPQ</span>
            <span className="logo-tagline">AI-Powered Learning Solutions</span>
          </div>
        </div>
        <h1>Course Module Builder</h1>
        <p>Create and organize educational content into structured courses</p>
      </div>
      
      <CourseModule />
      
      <footer>
        <p>© {new Date().getFullYear()} DestinPQ Educational Content Generator</p>
        <p>A powerful tool for educators and content creators</p>
      </footer>
    </div>
  );
} 