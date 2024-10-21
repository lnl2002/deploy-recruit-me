import React, { useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@nextui-org/react";
import { Upload } from "lucide-react";
import { ButtonApp } from "../ButtonApp";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { TJob } from "@/api/jobApi";

// Define your Gender enum and TJob type (replace with your actual types)
const gender = ["Male", "Female", "Others"];

// Form Props
type FormProps = {
  job: TJob;
  onApply: (cv: Partial<TJob>) => void;
  onCancel: () => void;
};

// Validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  firstName: Yup.string().required("FirstName is required"),
  lastName: Yup.string().required("LastName is required"),
  gender: Yup.string().required("Gender is required"),
  address: Yup.string().required("Address is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  cv: Yup.mixed().required("CV is required"), // Validation for CV file
});

export const FormApplyJob = ({ job, onApply, onCancel }: FormProps) => {
  
  const handleSubmit = (values: any) => {
    // Handle form submission here (send data to server, etc.)
    console.log("Form submitted:", values);
    onApply(values);
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
          <Form>
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
                      labelPlacement={"outside"}
                      label="Select gender"
                      classNames={{
                        listboxWrapper: "rounded-none",
                        listbox: "rounded-none",
                      }}
                      name="gender"
                      inputProps={{
                        classNames: {
                          inputWrapper:
                            "border border-borderSecondary rounded-none bg-white w-full",
                        },
                      }}
                      placeholder="Select your gender"
                      className="w-full"
                    >
                      {gender.map((item: string) => (
                        <AutocompleteItem key={item} value={item}>
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
              <Input
                classNames={{
                  inputWrapper: "border-none rounded-none bg-white p-0",
                  input: "placeholder:text-textIconBrand",
                }}
                type="file" // Use type="file" for file input
                label="CV available"
                labelPlacement={"outside"}
                placeholder="Upload CV"
                startContent={
                  <Upload color="#F36523" size={20} fill="currentColor" />
                }
                onChange={(event) => {
                  setFieldValue("cv", event.currentTarget.files![0]);
                }}
              />
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
    </div>
  );
};
