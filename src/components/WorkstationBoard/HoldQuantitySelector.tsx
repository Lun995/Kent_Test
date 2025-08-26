import React, { useState } from 'react';
import { Modal, NumberInput, Button, Group, Text, Stack } from '@mantine/core';

interface HoldQuantitySelectorProps {
  opened: boolean;
  onClose: () => void;
  item: {
    name: string;
    completedCount: number;
    originalCount: number;
  } | null;
  onConfirm: (quantity: number) => void;
}

export function HoldQuantitySelector({ 
  opened, 
  onClose, 
  item, 
  onConfirm 
}: HoldQuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    if (item && quantity > 0 && quantity <= item.completedCount) {
      onConfirm(quantity);
      setQuantity(1); // 重置數量
    }
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  if (!item) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="HOLD 品項數量"
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          品項：{item.name}
        </Text>
        
        <Text size="sm" c="dimmed">
          已完成：{item.completedCount} / {item.originalCount}
        </Text>

        <NumberInput
          label="HOLD 數量"
          value={quantity}
          onChange={(val) => setQuantity(val || 1)}
          min={1}
          max={item.completedCount}
          step={1}
          required
        />

        <Group justify="space-between" mt="md">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={quantity <= 0 || quantity > item.completedCount}
          >
            確認 HOLD
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

