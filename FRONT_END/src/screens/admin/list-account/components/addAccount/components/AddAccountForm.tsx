// /components/AddAccountForm.tsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@nextui-org/react";
import { toast } from "react-toastify";
import { IAccount } from "@/api/accountApi/accountApi";

export interface ICreateAccountForm {
  email: string;
  name: string;
  role: string;
  unit: string;
}

interface AddAccountFormProps {
  onSubmit: (values: ICreateAccountForm) => any;
  roles: { _id: string; roleName: string }[];
  units: { _id: string; name: string }[];
}

const AddAccountForm: React.FC<AddAccountFormProps> = ({
  onSubmit,
  roles,
  units,
}) => {
  const filteredRoles = roles.filter((role) => role.roleName !== "ADMIN");

  const initialValues: ICreateAccountForm = {
    email: "",
    name: "",
    role: "",
    unit: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    name: Yup.string().min(2, "Name is too short").required("Name is required"),
    role: Yup.string().required("Role is required"),
    unit: Yup.string().required("Unit is required"),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        const data = await onSubmit(values);
        if (!data) {
          toast.error("Something went wrong");
          return;
        }

        toast.success("Created successfully");
        resetForm();
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <Field
              id="name"
              name="name"
              placeholder="Enter name"
              className="w-full px-4 py-2 border rounded-md"
            />
            <ErrorMessage
              name="name"
              component="div"
              className="text-danger-500 text-sm"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              className="w-full px-4 py-2 border rounded-md"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="text-danger-500 text-sm"
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium">
              Role
            </label>
            <Field
              id="role"
              name="role"
              as="select"
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Select a role</option>
              {filteredRoles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.roleName}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="role"
              component="div"
              className="text-danger-500 text-sm"
            />
          </div>

          {/* Unit Dropdown */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium">
              Unit
            </label>
            <Field
              id="unit"
              name="unit"
              as="select"
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Select a unit</option>
              {units.map((unit) => (
                <option key={unit._id} value={unit._id}>
                  {unit.name}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="unit"
              component="div"
              className="text-danger-500 text-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              color="primary"
              className="bg-themeOrange w-full"
            >
              Submit
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddAccountForm;
