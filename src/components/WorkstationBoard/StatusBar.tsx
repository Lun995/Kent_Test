"use client";
import { useIsMobile } from '../../hooks/useIsMobile';
import { statusBarStyles } from '../../styles/statusBarStyles';

interface StatusBarProps {
  pendingBatches: number;
  overdueBatches: number;
}

export function StatusBar({ pendingBatches, overdueBatches }: StatusBarProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = statusBarStyles({ isMobile, isTablet });

  return (
    <div style={styles.container}>
      {/* 待製作批次 */}
      <div style={styles.statusItem}>
        <div style={styles.statusNumber}>{pendingBatches}</div>
        <span style={styles.statusText}>待製作批次</span>
      </div>
      
      {/* 逾時批次 */}
      <div style={styles.statusItem}>
        <span style={styles.statusText}>逾時批次</span>
        <div style={styles.statusNumber}>{overdueBatches}</div>
      </div>
    </div>
  );
}
