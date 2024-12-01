import React, { useState, useEffect, useCallback } from "react";
import { LottieApp } from "@/lotties";
import { camelToNormal, getLastKeySegment } from "@/utils/common";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import Lottie from "react-lottie";
import debounce from "lodash/debounce";

type Props = {
  isOpen: boolean;
  onOpenChange: () => void;
  isLoading: boolean;
  data: any;
  setData: (data: any) => void;
};

const ModalOCR = ({
  isOpen,
  onOpenChange,
  isLoading,
  data,
  setData,
}: Props) => {
  const [formData, setFormData] = useState(data);

  // Đồng bộ formData khi data thay đổi
  useEffect(() => {
    setFormData(data);
  }, [data]);

  // Debounce hàm setData để giảm tần suất gọi
  const debounceSetData = useCallback(
    debounce((updatedData) => setData(updatedData), 300),
    []
  );

  // Hàm thay đổi giá trị các trường
  const handleChange = (key: string, value: any) => {
    setFormData((prevData: any) => {
      const updatedData = { ...prevData };
      const keys = key.split(".");
      let temp: any = updatedData;

      // Duyệt qua key để cập nhật giá trị trong đối tượng lồng nhau
      keys.forEach((k, index) => {
        if (index === keys.length - 1) {
          temp[k] = value;
        } else {
          temp = temp[k];
        }
      });

      debounceSetData(updatedData); // Gọi debounce để tối ưu
      return updatedData;
    });
  };

  // Thêm mục vào mảng
  const handleAddArrayItem = (key: string, newItem: any) => {
    setFormData((prevData: any) => {
      const updatedData = { ...prevData };
      const items = key.split(".").reduce((acc, k) => acc[k], updatedData);
      items.push(newItem);

      debounceSetData(updatedData); // Gọi debounce
      return updatedData;
    });
  };

  // Xóa mục khỏi mảng
  const handleRemoveArrayItem = (key: string, index: number) => {
    setFormData((prevData: any) => {
      const updatedData = { ...prevData };
      const items = key.split(".").reduce((acc, k) => acc[k], updatedData);
      items.splice(index, 1);

      debounceSetData(updatedData); // Gọi debounce
      return updatedData;
    });
  };

  // Hàm render các trường trong form
  const renderField = (key: string, value: any) => {
    const displayKey = camelToNormal(getLastKeySegment(key));
    if (displayKey.toLowerCase() === "id") return null; // Ẩn các trường id

    if (Array.isArray(value)) {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-2 text-gray-700 font-bold">
            {displayKey}
          </label>
          {value.map((item, index) => (
            <div
              key={index}
              className="border p-4 mb-4 rounded-md bg-gray-50 shadow-sm"
            >
              {typeof item === "object" ? (
                Object.keys(item).map((subKey) =>
                  renderField(`${key}.${index}.${subKey}`, item[subKey])
                )
              ) : (
                <Input
                  value={item}
                  onChange={(e) =>
                    handleChange(`${key}.${index}`, e.target.value)
                  }
                  fullWidth
                />
              )}
              <Button
                onClick={() => handleRemoveArrayItem(key, index)}
                className="mt-2"
              >
                Remove {displayKey}
              </Button>
            </div>
          ))}
          <Button
            color="primary"
            onClick={() =>
              handleAddArrayItem(key, typeof value[0] === "object" ? {} : "")
            }
          >
            Add {displayKey}
          </Button>
        </div>
      );
    } else if (typeof value === "string") {
      const isLongText = value.length > 100; // Kiểm tra độ dài chuỗi
      return (
        <div key={key} className="mb-4">
          <label className="block mb-2 text-gray-700 font-bold">
            {displayKey}
          </label>
          {isLongText ? (
            <Textarea
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              fullWidth
              rows={4}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              fullWidth
            />
          )}
        </div>
      );
    } else if (typeof value === "boolean") {
      return (
        <div key={key} className="mb-4">
          <label className="block mb-2 text-gray-700 font-bold">
            {displayKey}
          </label>
          <Checkbox
            isSelected={value}
            onChange={(isSelected) => handleChange(key, isSelected)}
          >
            {displayKey}
          </Checkbox>
        </div>
      );
    } else if (typeof value === "object" && value !== null) {
      return (
        <div key={key} className="mb-4 border p-4 rounded-md bg-gray-50">
          <label className="block mb-2 text-gray-700 font-semibold">
            {displayKey}
          </label>
          {Object.keys(value).map((subKey) =>
            renderField(`${key}.${subKey}`, value[subKey])
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="text-themeDark min-h-128"
      size="5xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              CV Information
            </ModalHeader>
            <ModalBody className="max-h-[80vh] overflow-y-auto">
              {isLoading ? (
                <div className="text-center min-h-96 flex flex-col justify-center items-center">
                  <Lottie
                    style={{ width: 100, height: 100 }}
                    options={{
                      loop: true,
                      autoplay: true,
                      animationData: LottieApp.Loading,
                      rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice",
                      },
                    }}
                    isClickToPauseDisabled={true}
                    width={"100%"}
                  />
                  <div>Scanning your CV ...</div>
                </div>
              ) : null}

              {!isLoading && !formData && (
                <div className="text-center min-h-96 flex flex-col justify-center items-center">
                  <Lottie
                    style={{ width: 100, height: 100 }}
                    options={{
                      loop: false,
                      autoplay: true,
                      animationData: LottieApp.Error,
                      rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice",
                      },
                    }}
                    isClickToPauseDisabled={true}
                    width={"100%"}
                  />
                  <div>Something went wrong. Please try again!!</div>
                </div>
              )}

              {!isLoading && formData && (
                <div className="p-6 space-y-4 bg-white rounded-lg shadow-md">
                  {Object.keys(formData).map((key) =>
                    renderField(key, formData[key])
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
                onPress={onClose}
              >
                Close
              </Button>
              <Button
                className="bg-themeOrange text-[#fff]"
                onPress={() => {
                  onClose()
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

export default ModalOCR;
