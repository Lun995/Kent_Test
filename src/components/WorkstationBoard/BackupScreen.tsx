"use client";
import { Button } from '@mantine/core';
import { useIsMobile } from '../../hooks/useIsMobile';
import { backupScreenStyles } from '../../styles/backupScreenStyles';

interface BackupScreenProps {
  isVisible: boolean;
  onClose: () => void;
  totalCount: number;
}

export function BackupScreen({ isVisible, onClose, totalCount }: BackupScreenProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = backupScreenStyles({ isMobile, isTablet });

  if (!isVisible) return null;

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        備餐總數
      </div>
      <div style={styles.subtitle}>
        總計: {totalCount} 份
      </div>
      <Button
        variant="filled"
        color="gray"
        size={isMobile ? 'lg' : 'xl'}
        style={styles.closeButton}
        onClick={onClose}
      >
        返回
      </Button>
    </div>
  );
}
