"use client";
import { Button } from '@mantine/core';
import { ReactNode } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { settingButtonStyles } from '../../styles/settingButtonStyles';

interface SettingButtonProps {
  onClick: () => void;
  children: ReactNode;
  color?: string;
  disabled?: boolean;
  variant?: 'workstation' | 'setting';
}

export function SettingButton({ 
  onClick, 
  children, 
  color = "gray",
  disabled = false,
  variant = 'setting'
}: SettingButtonProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = settingButtonStyles({ isMobile, isTablet, variant });

  return (
    <Button
      variant="filled"
      color={color}
      size={isMobile ? 'xs' : isTablet ? 'sm' : 'md'}
      style={styles.button}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#e9ecef';
          e.currentTarget.style.transform = 'scale(1.02)';
          if (variant === 'setting') {
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.transform = 'scale(1)';
          if (variant === 'setting') {
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          }
        }
      }}
    >
      {children}
    </Button>
  );
}
