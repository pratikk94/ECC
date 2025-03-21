import AccessibilitySettings from '@/components/AccessibilitySettings';

export default function AccessibilityPage() {
  return (
    <div className="container">
      <div className="header">
        <div className="header-logo">
          <div className="logo-container">
            <span className="logo-text large">DestinPQ</span>
            <span className="logo-tagline">AI-Powered Learning Solutions</span>
          </div>
        </div>
        <h1>Accessibility Options</h1>
        <p>Customize your experience to make the application more accessible</p>
      </div>
      
      <AccessibilitySettings />
      
      <footer>
        <p>© {new Date().getFullYear()} DestinPQ Educational Content Generator</p>
        <p>A powerful tool for educators and content creators</p>
      </footer>
    </div>
  );
} 