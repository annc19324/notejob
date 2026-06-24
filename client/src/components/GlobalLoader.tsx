import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface GlobalLoaderProps {
  children: React.ReactNode;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: number;
    let pingInterval: number;
    let isConnected = false;

    const startLoading = () => {
      // Simulate progress going up to 95% while waiting for backend
      progressInterval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          // Increment smaller amounts as we get closer to 95
          const increment = Math.max(1, (95 - prev) * 0.05);
          return Math.min(95, prev + increment);
        });
      }, 500);

      // Ping backend periodically
      pingInterval = window.setInterval(async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await axios.get(`${API_URL}/api/health`, { timeout: 5000 });
          if (res.status === 200) {
            isConnected = true;
            clearInterval(pingInterval);
            clearInterval(progressInterval);
            
            // Jump to 100% when connected
            setProgress(100);
            
            // Wait a short moment before hiding the loader
            setTimeout(() => {
              setIsReady(true);
            }, 500);
          }
        } catch (error) {
          // Keep trying
        }
      }, 3000);
    };

    // Initial check without waiting for interval
    const initialCheck = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/health`, { timeout: 5000 });
        if (res.status === 200) {
          setIsReady(true);
          return;
        }
      } catch (error) {
        startLoading();
      }
    };

    initialCheck();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (pingInterval) clearInterval(pingInterval);
    };
  }, []);

  if (isReady) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-[#0A0A0B] flex flex-col items-center justify-center z-50 p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">NoteJob</h2>
          <p className="text-gray-400 text-sm">
            Waking up the server from sleep... This may take up to 50 seconds.
          </p>
        </div>
        
        <div className="relative h-2 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-center">
          <span className="text-indigo-400 font-medium tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
