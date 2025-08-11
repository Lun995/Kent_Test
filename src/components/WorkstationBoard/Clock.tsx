"use client";
import { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { clockStyles } from '../../styles/clockStyles';

export function Clock() {
  const { isMobile, isTablet } = useIsMobile();
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('zh-TW', { hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('zh-TW', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const styles = clockStyles({ isMobile, isTablet });

  return (
    <div style={styles.container}>
      {time}
    </div>
  );
}
