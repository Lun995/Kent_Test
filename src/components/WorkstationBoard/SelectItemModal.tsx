"use client";
import { Button as MantineButton } from '@mantine/core';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { selectItemModalStyles } from '../../styles/selectItemModalStyles';

interface SelectItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SelectItemModal({ isOpen, onClose }: SelectItemModalProps) {
  const { isMobile, isTablet } = useIsMobile();
  const styles = selectItemModalStyles({ isMobile, isTablet });

  if (!isOpen) return null;

  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.message}>
          請先選取一個品項
        </div>
        <MantineButton
          variant="filled"
          color="dark"
          size={isMobile ? 'sm' : 'md'}
          style={styles.confirmButton}
          onClick={onClose}
        >
          確認
        </MantineButton>
      </div>
    </div>,
    document.body
  );
}
