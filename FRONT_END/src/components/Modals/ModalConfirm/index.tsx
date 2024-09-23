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
  ["Xoá hình ảnh này ?", "Hình ảnh sẽ bị xoá vĩnh viễn khỏi hệ thống"],
  [
    "Thay thế hình ảnh mới ?",
    "Hình ảnh trước đó sẽ bị xoá vĩnh viễn khỏi hệ thống",
  ],
  [
    "Thêm hình ảnh mới ?",
    "Hãy đảm bảo dung lượng của ảnh không quá lớn",
  ],
  [
    "Xoá sản phẩm ?",
    "Sản phẩm cùng mọi hình ảnh liên quan sẽ bị xoá VĨNH VIỄN",
  ],
];

export type CommonModalProps = {
  onCloseModal?: () => void;
  onConfirm?: () => void;
  disclosure: DisclosureProp;
  children?: React.ReactNode;
  variant?: number;
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
  ({ onCloseModal, children, disclosure, variant }: CommonModalProps, ref) => {
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
        <ModalContent className="overflow-visible">
          <>
            <ModalBody>
              <div className="flex flex-col items-center">
                {variant !== undefined && (
                  <div className="flex flex-col justify-center items-center">
                    <p className="text-textPrimary text-xl my-5 text-center">
                      {VariantMessage[variant][0]}
                    </p>
                    <br />
                    <p className="text-textSecondary text-center">
                      {VariantMessage[variant][1]}
                    </p>
                  </div>
                )}
                {children}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onClick={disclosure.onClose} color="default">
                Huỷ bỏ
              </Button>
              <Button
                onClick={() => {
                  if (confirmHandler) confirmHandler();
                }}
                color="primary"
              >
                Xác nhận
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
