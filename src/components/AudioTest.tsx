import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@mantine/core';

interface AudioTestProps {
  isMobile: boolean;
}

export const AudioTest: React.FC<AudioTestProps> = ({ isMobile }) => {
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
      {/* 音效測試按鈕 */}
      <Button
        variant="outline"
        color="dark"
        size={isMobile ? 'xs' : 'md'}
        style={{
          width: '100%',
          flex: 1,
          minWidth: 0,
          maxWidth: '100%',
          fontSize: isMobile ? '0.8rem' : '1.2rem',
          fontWeight: 700,
          margin: 0,
          padding: isMobile ? '1px 2px' : '4px 8px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          background: isPlaying ? '#ff6b6b' : '#4ecdc4',
          color: '#fff',
          borderColor: isPlaying ? '#ff5252' : '#26a69a',
        }}
        onClick={testAllSounds}
      >
        {isPlaying ? '🔊播放中' : '🔊音效測試'}
      </Button>

      
    </>
  );
}; 