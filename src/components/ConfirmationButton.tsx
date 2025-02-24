import React, { cloneElement, ReactElement, useState } from 'react';
import { Button, Modal, Group, Text, ButtonProps, ModalProps } from '@mantine/core';

interface ConfirmationButtonProps {
  children: ReactElement<{ onClick?: () => void }>;
  confirmationText: string;
  onConfirm: () => void | Promise<void>;
  title?: string;
  modalProps?: Omit<ModalProps, 'opened' | 'onClose'>;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationButton: React.FC<ConfirmationButtonProps> = ({
  children,
  confirmationText,
  onConfirm,
  modalProps = {},
  confirmButtonProps = {},
  cancelButtonProps = {},
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
}) => {
  const [modalOpened, setModalOpened] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    await onConfirm();
    setIsProcessing(false);
    setModalOpened(false);
  };

  const triggerButton = cloneElement(children, {
    onClick: () => setModalOpened(true),
  });

  return (
    <>
      {triggerButton}
      <Modal
        centered
        withCloseButton={false}
        {...modalProps}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      >
        <Text size="sm">{confirmationText}</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setModalOpened(false)} {...cancelButtonProps}>
            {cancelButtonText}
          </Button>
          <Button
            color="red"
            onClick={handleConfirm}
            loading={isProcessing}
            {...confirmButtonProps}
          >
            {confirmButtonText}
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default ConfirmationButton;
