import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@mantine/core';

interface AudioTestProps {
  isMobile: boolean;
  isTablet?: boolean;
}

export const AudioTest: React.FC<AudioTestProps> = ({ isMobile, isTablet = false }) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 測試音效列表
  const testSounds = [
    { name: 'Bark 音效', file: '/bark.mp3', description: '測試音效' },
  ];

  useEffect(() => {
    // 初始化音效元素
    const audioElement = new Audio();
    audioElement.preload = 'auto';
    
    audioElement.addEventListener('play', () => setIsPlaying(true));
    audioElement.addEventListener('pause', () => setIsPlaying(false));
    audioElement.addEventListener('ended', () => setIsPlaying(false));
         audioElement.addEventListener('error', (e) => {
       console.error('音效播放錯誤:', e);
       setIsPlaying(false);
     });

    setAudio(audioElement);
    audioRef.current = audioElement;

    return () => {
      audioElement.pause();
      audioElement.remove();
    };
  }, []);

  const playSound = async (audioUrl: string) => {
    if (!audio) return;

    try {
      audio.src = audioUrl;
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error('播放音效失敗:', error);
    }
  };

  const testAllSounds = async () => {
    // 直接播放第一個音效
    if (testSounds.length > 0) {
      await playSound(testSounds[0].file);
    }
  };



  return (
    <>
             {/* 聲音測試按鈕 */}
      <Button
        variant="filled"
        color="blue"
        size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
        style={{
          width: 'calc(100% - 8px)',
          height: 'calc(100% - 8px)',
          fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.3rem',
          fontWeight: 700,
          margin: '0',
          padding: '4px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          background: isPlaying ? '#ff6b6b' : '#007bff',
          color: '#fff',
          border: isPlaying ? '2px solid #ff5252' : '2px solid #0056b3',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
        onClick={testAllSounds}
        onMouseEnter={(e) => {
          if (!isPlaying) {
            e.currentTarget.style.backgroundColor = '#0056b3';
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isPlaying) {
            e.currentTarget.style.backgroundColor = '#007bff';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          }
        }}
      >
                 <div style={{ fontSize: isMobile ? '1.0rem' : isTablet ? '1.2rem' : '1.4rem', fontWeight: 700, color: '#fff' }}>
           {isPlaying ? '🔊播放中' : '聲音'}
         </div>
         <div style={{ fontSize: isMobile ? '1.0rem' : isTablet ? '1.2rem' : '1.4rem', fontWeight: 700, color: '#fff' }}>
           {isPlaying ? '' : '測試'}
         </div>
      </Button>
    </>
  );
}; 