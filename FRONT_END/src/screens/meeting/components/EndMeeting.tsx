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
  onEndMeeting: () => void;
};

const EndMeeting: React.FC<EndMeetingProps> = ({
  onOpenChange,
  isOpen,
  onEndMeeting,
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
                  Are you sure to end this meeting?
                </p>
                <p className="text-center text-sm text-blurEffect">
                  Please proceed with caution as you are about to end this
                  interview. Once you confirm, you can inform the candidate of
                  the decision later.
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
                onPress={onEndMeeting}
              >
                Yes, end meeting
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EndMeeting;
