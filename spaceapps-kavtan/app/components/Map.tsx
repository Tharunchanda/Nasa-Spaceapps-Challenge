'use client'
import { useEffect, useState } from 'react';

const DualMap = () => {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the dual_map.html from the Flask server
    const fetchHtmlMap = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/'); // Flask URL serving the HTML
        const htmlText = await response.text();
        setHtmlContent(htmlText);  // Save the HTML content in the state
      } catch (error) {
        console.error('Error fetching the map HTML:', error);
      }
    };

    fetchHtmlMap();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <iframe
        src="/dual_map.html"  // This serves the dual_map.html file from the public folder
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="Dual Map"
      />
    </div>
  );
};

export default DualMap;
