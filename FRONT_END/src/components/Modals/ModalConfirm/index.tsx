"use client"
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from "@nextui-org/react";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const VariantMessage = [
  ["Are you sure?", "This acction cannot be reversed"],
];

export type CommonModalProps = {
  onCloseModal?: () => void;
  onConfirm?: () => void;
  disclosure: DisclosureProp;
  children?: React.ReactNode;
  variant?: number;
  title?: string;
  description?: string;
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

export type ModalConfirmRef = {
  setOnConfirm: (handler: () => void) => void;
};

const ModalConfirm = forwardRef<ModalConfirmRef, CommonModalProps>(
  ({ onCloseModal, children, disclosure, variant, title, description,onConfirm }: CommonModalProps, ref) => {
    const modalRef = useRef(null);
    const [confirmHandler, setConfirmHandler] = useState<() => void>(() => {});

    useImperativeHandle(ref, () => ({
      setOnConfirm: (handler: () => void) => {
        setConfirmHandler(() => handler);
      },
    }));

    return (
      <Modal
        isOpen={disclosure.isOpen}
        onClose={onCloseModal}
        onOpenChange={disclosure.onOpenChange}
        placement="top-center"
        ref={modalRef}
      >
        <ModalContent className="overflow-visible text-themeDark">
          <>
            <ModalBody>
              <div className="flex flex-col items-center">
                {variant !== undefined && (
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-textPrimary text-xl my-3 text-center">
                      {VariantMessage[variant][0]}
                    </p>
                    <br />
                    <p className="text-textSecondary text-center">
                      {VariantMessage[variant][1]}
                    </p>
                  </div>
                )}
                {variant === undefined && (title || description) && (
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-textPrimary text-xl mt-3 text-center" dangerouslySetInnerHTML={{__html: title || ''}}>
                    </p>
                    <br />
                    <p className="text-textPrimary text-center opacity-70">
                      {description}
                    </p>
                  </div>
                )}
                {children}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
                radius="full"
                onClick={disclosure.onClose} 
                >
                Cancel
              </Button>
              <Button
                className="bg-themeOrange text-[#fff]"
                radius="full"
                onClick={onConfirm}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    );
  }
);

// Add display name for debugging purposes
ModalConfirm.displayName = "ModalConfirm";

export default ModalConfirm;
