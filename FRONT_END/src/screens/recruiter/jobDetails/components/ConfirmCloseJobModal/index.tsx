import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

interface ConfirmCloseJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export const ConfirmCloseJobModal: React.FC<ConfirmCloseJobModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-themeDark">
              Confirm Close Job
            </ModalHeader>
            <ModalBody>
              <p className="text-themeDark">
                Are you sure you want to close this job? This action cannot be
                undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  if (onConfirm) onConfirm(); // Trigger the confirm callback
                  onClose(); // Close the modal
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
