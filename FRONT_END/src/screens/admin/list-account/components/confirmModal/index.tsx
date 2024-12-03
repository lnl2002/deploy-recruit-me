import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import Image from "next/image";

type EndMeetingProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
};

const ConfirmModal: React.FC<EndMeetingProps> = ({
  onOpenChange,
  isOpen,
  onConfirm,
  title,
  description,
}): React.JSX.Element => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{ base: "max-w-xl", closeButton: "hidden" }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-center">
              <Image
                width={80}
                height={80}
                objectFit="contain"
                src={"/images/warning.jpg"}
                alt="product_link_image"
              />
            </ModalHeader>
            <ModalBody>
              <div className="">
                <p className="text-xl text-center font-bold text-themeDark">
                  {title}
                </p>
                <p className="text-center text-sm text-blurEffect">
                  {description}
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="bordered"
                radius="full"
                className="w-1/2"
                onPress={onClose}
              >
                Not now
              </Button>
              <Button
                color="primary"
                className="bg-themeOrange w-1/2"
                radius="full"
                onPress={onConfirm}
              >
                Yes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
