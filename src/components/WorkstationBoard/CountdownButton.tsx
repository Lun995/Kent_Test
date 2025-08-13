"use client";
import { Button } from '@mantine/core';
import { useIsMobile } from '../../hooks/useIsMobile';
import { countdownButtonStyles } from '../../styles/countdownButtonStyles';

interface CountdownButtonProps {
  onClick: () => void;
  currentItem: number;
  totalItems: number;
  countdown: number;
  disabled?: boolean;
}

export function CountdownButton({ 
  onClick, 
  currentItem, 
  totalItems, 
  countdown,
  disabled = false 
}: CountdownButtonProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = countdownButtonStyles({ isMobile, isTablet });

  return (
    <Button
      variant="filled"
      color="dark"
      size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
      style={styles.button}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#e9ecef';
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        }
      }}
    >
      <div style={styles.countdownText}>
        {currentItem}/{totalItems}項
      </div>
      <div style={styles.countdownText}>
        {countdown}秒
      </div>
      <div style={styles.countdownText}>
        自動
      </div>
    </Button>
  );
}
