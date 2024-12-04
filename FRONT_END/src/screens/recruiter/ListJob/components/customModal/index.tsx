import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobName?: string; // Optional if you want to display the job name
};

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobName,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-themeDark">
              Confirm Job Deletion
            </ModalHeader>
            <ModalBody>
              <p className="text-themeDark">
                Are you sure you want to delete the job{" "}
                <strong>{jobName ?? "this job"}</strong>? This action will
                permanently remove the job from the system and cannot be undone.
              </p>
              <p className="text-themeDark">
                Please make sure you want to proceed with this action.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onCloseModal}>
                Cancel
              </Button>
              <Button color="danger" onPress={onConfirm}>
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmDeleteModal;
