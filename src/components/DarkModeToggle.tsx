"use client";

import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // On component mount, check if user has a preference
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    
    // If saved preference exists, use it
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
      }
    } 
    // Otherwise check system preference
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button 
      className="dark-mode-toggle" 
      onClick={toggleDarkMode}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 20V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.63605 5.63604L6.34315 6.34315" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.6569 17.6569L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.63605 18.364L6.34315 17.6569" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.6569 6.34315L18.364 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3C10.8065 3 9.66193 3.29359 8.6402 3.86121C7.61847 4.42883 6.75713 5.25292 6.14842 6.25656C5.53971 7.26021 5.20595 8.40261 5.17641 9.57558C5.14687 10.7486 5.42239 11.9069 5.97767 12.9418C6.53296 13.9766 7.34547 14.8441 8.33921 15.4683C9.33294 16.0925 10.4699 16.4515 11.6426 16.5064C12.8154 16.5613 13.9827 16.3103 15.0315 15.7776C16.0804 15.2448 16.9731 14.4508 17.6241 13.4727C17.6885 13.3756 17.7344 13.2682 17.7593 13.1552C17.7842 13.0422 17.7877 12.9255 17.7696 12.8113C17.7515 12.6971 17.712 12.5875 17.6531 12.4874C17.5943 12.3873 17.5171 12.2984 17.4256 12.2255C17.334 12.1527 17.2296 12.0972 17.1176 12.0619C17.0056 12.0267 16.8883 12.0122 16.7714 12.0193C16.6545 12.0264 16.5402 12.0549 16.4337 12.1035C16.3271 12.1521 16.2303 12.2198 16.149 12.3028C15.6593 12.9163 15.0231 13.3938 14.303 13.6866C13.5829 13.9793 12.7998 14.0777 12.0298 13.9725C11.2599 13.8674 10.5297 13.5622 9.90738 13.0825C9.28503 12.6028 8.79158 11.9644 8.47435 11.2317C8.15712 10.499 8.02658 9.69734 8.09553 8.90196C8.16447 8.10658 8.43033 7.34302 8.86959 6.68467C9.30885 6.02632 9.90646 5.4918 10.6077 5.12433C11.3089 4.75687 12.0908 4.56825 12.882 4.57537C12.9844 4.57795 13.0869 4.56772 13.1871 4.54492C13.2872 4.52212 13.384 4.48698 13.4742 4.44077C13.5644 4.39456 13.647 4.33775 13.7193 4.27217C13.7915 4.20659 13.8525 4.13299 13.9003 4.05361C13.9481 3.97423 13.9821 3.8901 14.0012 3.80276C14.0202 3.71542 14.0243 3.62595 14.0131 3.53748C14.0019 3.44901 13.9756 3.36274 13.9351 3.28225C13.8947 3.20176 13.8406 3.12816 13.7752 3.06425C13.709 2.99234 13.6289 2.93426 13.5399 2.89342C13.451 2.85258 13.3551 2.82976 13.2575 2.82639C12.8428 2.8081 12.4271 2.8081 12.0125 2.82639C12.0083 2.82639 12.0042 2.82639 12 2.82639" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 5L19.9 4.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 19L19.9 19.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 19L4.1 19.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 5L4.1 4.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
} 