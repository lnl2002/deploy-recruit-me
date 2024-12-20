"use client";
import React, { useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  useDisclosure,
} from "@nextui-org/react";
import { Upload } from "lucide-react";
import { ButtonApp } from "../ButtonApp";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { TJob } from "@/api/jobApi";
import applyApi, { ICV } from "@/api/applyApi";
import ModalOCR from "./components/ModalOCR";

// Define your Gender enum and TJob type (replace with your actual types)
const gender = ["Male", "Female", "Others"];

// Form Props
type FormProps = {
  job: TJob;
  onApply: (cv: ICV) => void;
  onCancel: () => void;
  ocrCV: any;
  setOcrCV: (data: any) => void;
};

// Validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  firstName: Yup.string().required("FirstName is required"),
  lastName: Yup.string().required("LastName is required"),
  gender: Yup.string().required("Gender is required"),
  address: Yup.string().required("Address is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  cv: Yup.mixed<File>()
    .required("CV is required")
    .test(
      "fileType",
      "Please upload a PDF file.",
      (value) => !!value && value.type === "application/pdf"
    )
    .test(
      "fileSize",
      "File size must be less than or equal to 5MB.",
      (value) => !!value && value.size <= 5 * 1024 * 1024
    ),// 5MB in bytes 
});

export const FormApplyJob = ({
  job,
  onApply,
  onCancel,
  ocrCV,
  setOcrCV,
}: FormProps) => {
  const OCRModal = useDisclosure();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (values: any) => {
    // Handle form submission here (send data to server, etc.)
    console.log("Form submitted:", values);
    onApply(values);
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;

    try {
      OCRModal.onOpen();

      setIsLoading(true);
      const response = await applyApi.getOcrCV(file);
      setOcrCV(response?.data?.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <p className="text-primary-900 text-2xl font-bold text-center mb-2 mt-6">
          Send CV now
        </p>
        <p className="text-primary-900 text-sm font-normal text-center">
          Thank you for considering FPT Education as your career path. Joining
          us will help you improve your chances of finding your dream job.
        </p>
      </div>

      <Formik
        initialValues={{
          email: "",
          lastName: "",
          firstName: "",
          gender: gender[0],
          address: "",
          phoneNumber: "",
          cv: null,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form encType="multipart/form-data">
            <div className="mt-16">
              <Input
                classNames={{
                  inputWrapper: "rounded-none",
                }}
                type="email"
                label="Desired job"
                disabled={true}
                labelPlacement={"outside"}
                placeholder={job.title}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="col-span-1">
                <Field
                  as={Input}
                  className=""
                  classNames={{
                    inputWrapper:
                      "border border-borderSecondary rounded-none bg-white",
                  }}
                  type="text"
                  label="First Name"
                  labelPlacement={"outside"}
                  placeholder="Enter your first name"
                  name="firstName"
                />
                <ErrorMessage
                  name="firstName"
                  component="div"
                  className="text-danger-500 text-xs"
                />
              </div>

              <div className="col-span-1">
                <Field
                  as={Input}
                  classNames={{
                    inputWrapper:
                      "border border-borderSecondary rounded-none bg-white",
                  }}
                  type="text"
                  label="Last Name"
                  labelPlacement={"outside"}
                  placeholder="Enter your last name"
                  name="lastName"
                />
                <ErrorMessage
                  name="lastName"
                  component="div"
                  className="text-danger-500 text-xs"
                />
              </div>
            </div>

            <div className="mt-12">
              <Field name="gender">
                {(
                  { field, meta }: any // Access Formik's field and meta props
                ) => (
                  <div>
                    <Autocomplete
                      {...field} // Spread Formik field props
                      labelPlacement="outside"
                      label="Select gender"
                      classNames={{
                        listboxWrapper: "rounded-none",
                        listbox: "rounded-none",
                      }}
                      name="gender"
                      allowsCustomValue={false}
                      inputProps={{
                        className: "text-textPrimary",
                        classNames: {
                          inputWrapper:
                            "border border-borderSecondary rounded-none bg-white w-full",
                        },
                      }}
                      readOnly={true}
                      placeholder="Select your gender"
                      className="w-full"
                    >
                      {gender.map((item) => (
                        <AutocompleteItem
                          key={item}
                          value={item}
                          classNames={{
                            title: "text-surfaceBrand",
                          }}
                        >
                          {item}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                    <ErrorMessage
                      name="gender"
                      component="div"
                      className="text-danger-500 text-xs"
                    />
                  </div>
                )}
              </Field>
            </div>

            <div className="mt-12">
              <Field
                as={Input}
                classNames={{
                  inputWrapper:
                    "border border-borderSecondary rounded-none bg-white",
                }}
                type="text"
                label="Address"
                labelPlacement={"outside"}
                placeholder="Enter your address"
                name="address"
              />
              <ErrorMessage
                name="address"
                component="div"
                className="text-danger-500 text-xs"
              />
            </div>

            <div className="mt-12">
              <Field
                as={Input}
                className=""
                classNames={{
                  inputWrapper:
                    "border border-borderSecondary rounded-none bg-white",
                }}
                type="email"
                label="Email"
                labelPlacement={"outside"}
                placeholder="Enter your email"
                name="email"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-danger-500 text-xs"
              />
            </div>

            <div className="mt-12">
              <Field
                as={Input}
                classNames={{
                  inputWrapper:
                    "border border-borderSecondary rounded-none bg-white",
                }}
                type="number"
                label="Phone number"
                labelPlacement={"outside"}
                placeholder="Enter your phone number"
                name="phoneNumber"
              />
              <ErrorMessage
                name="phoneNumber"
                component="div"
                className="text-danger-500 text-xs"
              />
            </div>

            <div className="mt-12">
              {/* CV Upload (You need to implement the logic) */}
              <div className="flex items-end gap-3">
                <Input
                  classNames={{
                    inputWrapper: "border-none rounded-none bg-white p-0",
                    input: "text-textPrimary file:border-0 file:text-sm",
                  }}
                  type="file" // Use type="file" for file input
                  label="CV available"
                  name="cv"
                  labelPlacement={"outside"}
                  placeholder="Upload CV"
                  startContent={
                    <Upload color="#F36523" size={20} fill="currentColor" />
                  }
                  onChange={(event) => {
                    setFieldValue("cv", event.currentTarget.files![0]);
                    handleFileChange(event.currentTarget.files![0]);
                  }}
                />
                {ocrCV && (
                  <Button
                    className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
                    onPress={() => OCRModal.onOpen()}
                  >
                    CV Information
                  </Button>
                )}
              </div>

              <ErrorMessage
                name="cv"
                component="div"
                className="text-danger-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12">
              <ButtonApp
                onClick={onCancel}
                className="bg-white text-textIconBrand border w-full col-span-1"
                title="Not now"
              />
              <ButtonApp
                type="submit"
                className="w-full col-span-1 text-white"
                title="Submit CV"
              />
            </div>
          </Form>
        )}
      </Formik>
      <ModalOCR
        isOpen={OCRModal.isOpen}
        onOpenChange={OCRModal.onOpenChange}
        isLoading={isLoading}
        key={`${isLoading}-${ocrCV}`}
        data={ocrCV}
        setData={setOcrCV}
      />
    </div>
  );
};
