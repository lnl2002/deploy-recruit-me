import accountApi from "@/api/accountApi/accountApi";
import { TRole } from "@/api/roleApi";
import { TUnit } from "@/api/unitApi";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import AddAccountForm, {
  ICreateAccountForm,
} from "./components/AddAccountForm";

type EndMeetingProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  roles: TRole[];
  units: TUnit[];
  fetchJobs: any
};

const AddAccount: React.FC<EndMeetingProps> = ({
  onOpenChange,
  isOpen,
  onConfirm,
  roles,
  units,
  fetchJobs
}): React.JSX.Element => {
  const handleFormSubmit = async (values: ICreateAccountForm) => {
    const data = await accountApi.createAccount(values);
    if(data){
      fetchJobs()
    }
    return data
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{ base: "max-w-xl", closeButton: "hidden" }}
      className="text-themeDark"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-center">
              <h3>Add New Account</h3>
            </ModalHeader>
            <ModalBody>
              <AddAccountForm
                onSubmit={handleFormSubmit}
                roles={roles}
                units={units}
              />
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddAccount;
