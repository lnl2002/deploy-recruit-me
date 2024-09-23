import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalProps,
} from "@nextui-org/react";
import React from "react";

type CommonModalProps = {
  onCloseModal?: () => void;
  onPossitive?: () => void;
  disclosure: DisclosureProp;
  children?: React.ReactNode;
  size?: any
};

type DisclosureProp = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenChange: () => void;
  isControlled: boolean;
  getButtonProps: (props?: unknown) => unknown;
  getDisclosureProps: (props?: unknown) => unknown;
};

export default function ModalCommon({
  onCloseModal,
  children,
  disclosure,
  size
}: CommonModalProps) {
  return (
    <Modal
      isOpen={disclosure.isOpen}
      onClose={onCloseModal && onCloseModal}
      onOpenChange={disclosure.onOpenChange}
      placement="top-center"
      size={size || "lg"}
    >
      <ModalContent className="overflow-visible">
        {() => (
          <>
            <ModalBody>
              <div className="flex flex-col items-center">{children}</div>
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
