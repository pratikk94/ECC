"use client";

import { useState, useEffect } from 'react';

interface ContentEnrichmentProps {
  content: string;
  topic: string;
}

interface ImageSuggestion {
  id: string;
  url: string;
  alt: string;
  source: string;
}

interface VideoSuggestion {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  source: string;
  duration: string;
}

export default function ContentEnrichment({ content, topic }: ContentEnrichmentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageSuggestions, setImageSuggestions] = useState<ImageSuggestion[]>([]);
  const [videoSuggestions, setVideoSuggestions] = useState<VideoSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');

  // Mock image suggestions - In a real app, this would be an API call
  useEffect(() => {
    if (!content || !topic) return;

    setIsLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      try {
        // Generate mock image data based on topic
        const mockImages: ImageSuggestion[] = [
          {
            id: '1',
            url: `https://source.unsplash.com/featured/?${encodeURIComponent(topic)}`,
            alt: `Illustration related to ${topic}`,
            source: 'Unsplash'
          },
          {
            id: '2',
            url: `https://source.unsplash.com/featured/?${encodeURIComponent(topic)},education`,
            alt: `Educational illustration for ${topic}`,
            source: 'Unsplash'
          },
          {
            id: '3',
            url: `https://source.unsplash.com/featured/?${encodeURIComponent(topic)},learning`,
            alt: `Learning resource for ${topic}`,
            source: 'Unsplash'
          },
          {
            id: '4',
            url: `https://source.unsplash.com/featured/?${encodeURIComponent(topic)},diagram`,
            alt: `Diagram illustrating ${topic}`,
            source: 'Unsplash'
          }
        ];

        // Generate mock video data based on topic
        const mockVideos: VideoSuggestion[] = [
          {
            id: 'v1',
            title: `Introduction to ${topic}`,
            thumbnailUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(topic)},video`,
            videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}+introduction`,
            source: 'YouTube',
            duration: '10:23'
          },
          {
            id: 'v2',
            title: `${topic} - Advanced Concepts`,
            thumbnailUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(topic)},advanced`,
            videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}+advanced+concepts`,
            source: 'YouTube',
            duration: '15:45'
          },
          {
            id: 'v3',
            title: `${topic} - Khan Academy`,
            thumbnailUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(topic)},khan`,
            videoUrl: `https://www.khanacademy.org/search?search_again=1&page_search_query=${encodeURIComponent(topic)}`,
            source: 'Khan Academy',
            duration: '8:52'
          }
        ];

        setImageSuggestions(mockImages);
        setVideoSuggestions(mockVideos);
      } catch (err) {
        setError('Failed to load suggestions. Please try again.');
        console.error('Error loading suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  }, [content, topic]);

  const handleImageEmbed = (image: ImageSuggestion) => {
    // In a real app, this would embed the image into the content
    console.log('Embedding image:', image);
    alert(`Image would be embedded: ${image.alt}`);
  };

  const handleVideoEmbed = (video: VideoSuggestion) => {
    // In a real app, this would embed the video into the content
    console.log('Embedding video:', video);
    alert(`Video would be embedded: ${video.title}`);
  };

  if (isLoading) {
    return (
      <div className="enrichment-loading">
        <div className="loading-spinner"></div>
        <p>Finding relevant enrichment content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enrichment-error">
        <p>{error}</p>
        <button className="button" onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="content-enrichment">
      <div className="enrichment-tabs">
        <button 
          className={`enrichment-tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Images
        </button>
        <button 
          className={`enrichment-tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          Videos
        </button>
      </div>

      <div className="enrichment-content">
        {activeTab === 'images' && (
          <div className="image-suggestions">
            <h3>Suggested Images</h3>
            <p className="suggestion-info">Click on an image to insert it into your content</p>
            
            {imageSuggestions.length === 0 ? (
              <p className="no-suggestions">No image suggestions available.</p>
            ) : (
              <div className="image-grid">
                {imageSuggestions.map(image => (
                  <div key={image.id} className="image-item" onClick={() => handleImageEmbed(image)}>
                    <div className="image-preview">
                      <img src={image.url} alt={image.alt} />
                    </div>
                    <div className="image-info">
                      <p className="image-description">{image.alt}</p>
                      <p className="image-source">Source: {image.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="video-suggestions">
            <h3>Suggested Videos</h3>
            <p className="suggestion-info">Click on a video to embed it into your content</p>
            
            {videoSuggestions.length === 0 ? (
              <p className="no-suggestions">No video suggestions available.</p>
            ) : (
              <div className="video-list">
                {videoSuggestions.map(video => (
                  <div key={video.id} className="video-item" onClick={() => handleVideoEmbed(video)}>
                    <div className="video-thumbnail">
                      <img src={video.thumbnailUrl} alt={video.title} />
                      <span className="video-duration">{video.duration}</span>
                    </div>
                    <div className="video-info">
                      <h4 className="video-title">{video.title}</h4>
                      <p className="video-source">Source: {video.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 