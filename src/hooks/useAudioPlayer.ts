import { useState, useEffect } from 'react';

export function useAudioPlayer() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // 創建音效元素
    const audioElement = new Audio('/notification.mp3'); // 預設音效檔案
    audioElement.preload = 'auto';
    
    audioElement.addEventListener('play', () => setIsPlaying(true));
    audioElement.addEventListener('pause', () => setIsPlaying(false));
    audioElement.addEventListener('ended', () => setIsPlaying(false));
    audioElement.addEventListener('error', (e) => {
      console.error('音效播放錯誤:', e);
      setIsPlaying(false);
    });

    setAudio(audioElement);

    return () => {
      audioElement.pause();
      audioElement.remove();
    };
  }, []);

  const playSound = (audioUrl?: string) => {
    if (audio) {
      if (audioUrl) {
        audio.src = audioUrl;
      }
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.error('播放音效失敗:', error);
      });
    }
  };

  const stopSound = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  return { playSound, stopSound, isPlaying };
}
