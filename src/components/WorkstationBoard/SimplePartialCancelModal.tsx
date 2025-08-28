"use client";

import { Button, NumberInput, Modal, Text, Stack, Group } from '@mantine/core';
import { useState } from 'react';

interface SimplePartialCancelModalProps {
  opened: boolean;
  onClose: () => void;
  selectedItem: string | null;
  onConfirm: (quantity: number) => void;
}

export function SimplePartialCancelModal({
  opened,
  onClose,
  selectedItem,
  onConfirm
}: SimplePartialCancelModalProps) {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    if (quantity > 0) {
      onConfirm(quantity);
      setQuantity(1);
      onClose();
    }
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="部分銷單"
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          選擇要部分銷單的數量
        </Text>

        <NumberInput
          label="銷單數量"
          value={quantity}
          onChange={(val) => setQuantity(typeof val === 'number' ? val : 1)}
          min={1}
          max={10}
          step={1}
          required
        />

        <Group justify="space-between" mt="md">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={quantity <= 0}
          >
            確認
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}




