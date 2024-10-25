"use client";
import dynamic from "next/dynamic";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  DateValue,
} from "@nextui-org/react";
import { DatePicker } from "@nextui-org/date-picker";
import { ArrowLeft, ArrowRight, DollarSign, MapPin } from "lucide-react";
import { Key, useEffect, useMemo, useState } from "react";
import unitApi, { TUnit } from "@/api/unitApi";
import accountApi, { IAccount } from "@/api/accountApi/accountApi";
import jobApi, { TJob } from "@/api/jobApi";
import careerApi, { TCareer } from "@/api/careerApi";
import { TLocation } from "@/api/locationApi";
import AutocompleteComponent from "./select";
import InputComponent from "./input";
import TextareaComponent from "./textarea";

const CustomEditor = dynamic(() => import("./custom"), {
  ssr: false,
});

const requiredFields = [
  "title",
  "description",
  "requests",
  "benefits",
  "unit",
  "account",
  "interviewManager",
  "career",
  "location",
  "numberPerson",
  "minSalary",
  "maxSalary",
  "expiredDate",
  "address",
  "type",
];

interface JobType {
  _id: string;
  name: string;
}

const types: JobType[] = [
  { _id: "fulltime", name: "Fulltime" },
  { _id: "parttime", name: "Parttime" },
  { _id: "hybrid", name: "Hybrid" },
  { _id: "remote", name: "Remote" },
  { _id: "remote-fulltime", name: "Remote Fulltime" },
  { _id: "remote-parttime", name: "Remote Parttime" },
];

export const AddJob = (): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState("Job Description");
  const [formValue, setFormValue] = useState<Partial<TJob>>({});
  const [formValueError, setFormValueError] = useState<Partial<TJob>>({});
  const [unitList, setUnitList] = useState<Partial<TUnit[]> | []>([]);
  const [unit, setUnit] = useState<Partial<TUnit>>({});
  const [userInfo, setUserInfo] = useState<Partial<IAccount>>({});
  const [careerList, setCareerList] = useState<Partial<TCareer[]> | []>([]);
  const [accountList, setAccountList] = useState<Partial<IAccount[]> | []>([]);
  const [dateSelected, setDateSelected] = useState<DateValue | null>();

  useEffect(() => {
    (async () => {
      const { units } = await unitApi.getUnitList();
      const { careers } = await careerApi.getCareerList();
      setUnitList(units);
      setCareerList(careers);
    })();
  }, []);

  useEffect(() => {
    try {
      const { userInfo } = JSON.parse(
        localStorage.getItem("persist:root") as string
      );
      const userInfoParse = JSON.parse(userInfo);
      setUserInfo(userInfoParse);
      setFormValue(
        (pre): Partial<TJob> => ({
          ...pre,
          account: userInfoParse._id,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!formValue?.unit) return;

      const params = `&unit=${
        formValue?.unit
      }&role=${"6718eb41b203b7efd13871ca"}`;
      const { accounts } = await accountApi.getListAccount(params);
      const { unit } = await unitApi.getUnit(formValue?.unit as string);
      setAccountList(accounts);
      setUnit(unit);
    })();
  }, [formValue?.unit]);

  useEffect(() => {
    console.log(formValue);
  }, [formValue]);

  const handleOnChange = (value: string, label: string) => {
    if (label === "job description") {
      setFormValue(
        (pre): Partial<TJob> => ({
          ...pre,
          description: value ?? pre?.description,
        })
      );
    } else if (label === "requests") {
      setFormValue(
        (pre): Partial<TJob> => ({
          ...pre,
          requests: value ?? pre?.requests,
        })
      );
    } else if (label === "benefits") {
      setFormValue(
        (pre): Partial<TJob> => ({
          ...pre,
          benefits: value ?? pre?.benefits,
        })
      );
    }
  };

  const onSelectionUnitChange = (key: Key | null) => {
    const unitId = key?.toString();
    setFormValue(
      (pre): Partial<TJob> => ({ ...pre, unit: unitId ?? pre?.unit })
    );
  };

  const onSelectionAccountChange = (key: Key | null) => {
    const interviewManger = key?.toString();
    setFormValue(
      (pre): Partial<TJob> => ({
        ...pre,
        interviewManager: interviewManger ?? pre?.interviewManager,
      })
    );
  };

  const onSelectionCareerChange = (key: Key | null) => {
    const career = key?.toString();
    setFormValue(
      (pre): Partial<TJob> => ({
        ...pre,
        career: career ?? pre?.career,
      })
    );
  };

  const onSelectionLocationChange = (key: Key | null) => {
    const location = key?.toString();
    setFormValue(
      (pre): Partial<TJob> => ({
        ...pre,
        location: location ?? pre?.location,
      })
    );
  };

  const onSelectionTypeChange = (key: Key | null) => {
    const type = key?.toString();
    setFormValue(
      (pre): Partial<TJob> => ({
        ...pre,
        type: type ?? pre?.type,
      })
    );
  };

  const onDateChange = (value: DateValue) => {
    const date = new Date();
    date.setFullYear(value.year);
    date.setMonth(value.month - 1);
    date.setDate(value.day);

    if (new Date().getTime() > date.getTime()) {
      setFormValueError((pre) => ({
        ...pre,
        expiredDate: "Please select a date after current!",
      }));
      setFormValue((pre) => ({
        ...pre,
        expiredDate: "",
      }));
      setDateSelected(null);
      return;
    }

    setFormValueError((pre) => ({
      ...pre,
      expiredDate: "",
    }));

    setFormValue(
      (pre): Partial<TJob> => ({
        ...pre,
        expiredDate: date.toISOString(),
      })
    );
    setDateSelected(value);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    let parsedValue: string | number = "";
    if (value) {
      parsedValue = isNaN(Number(value)) ? value : Number(value);
    }

    setFormValue(
      (pre): Partial<TJob> => ({
        ...pre,
        [name as keyof TJob]: parsedValue,
      })
    );
  };

  const handleSubmit = async () => {
    const missingFields = requiredFields.filter(
      (field) => !formValue[field as keyof TJob]
    );

    for (const field of requiredFields) {
      if (!formValue[field as keyof TJob]) {
        setFormValueError((pre) => ({
          ...pre,
          [field]: "Please enter a field value!",
        }));
      } else {
        setFormValueError((pre) => ({
          ...pre,
          [field]: "",
        }));
      }
    }
    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      if (missingFields.includes("account")) {
        console.log("Login required!");
      }
      return;
    }

    const res = await jobApi.addJob(formValue);
  };

  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="w-[1200px] h-[1173px] bg-white px-[204px]">
        <div className="mt-[60px]">
          <h1 className="mb-[4px] text-3xl font-medium text-[#999]">
            Post a new job
          </h1>
          <p className="text-backgroundDecor500 text-base">
            Create a job and hire your talented candidate now! 🌟
          </p>
        </div>

        <div className="mt-[40px] max-h-full flex items-center">
          <div className="flex w-full flex-col">
            <Tabs
              aria-label="Options"
              variant="underlined"
              color="warning"
              selectedKey={activeTab} // Điều khiển tab hiện tại
            >
              <Tab key="Job Description" title="1. Job Description Information">
                <Card className="py-5 px-3">
                  <CardBody>
                    <div>
                      <TextareaComponent
                        label="Job Title"
                        name="title"
                        labelPlacement="outside"
                        placeholder="Add Job Title"
                        value={formValue.title}
                        onChange={onChange}
                        isInvalid={!!formValueError.title}
                        errorMessage={formValueError.title}
                      />
                      <AutocompleteComponent
                        items={unitList as TUnit[]}
                        label="Unit"
                        placeholder="Select a unit"
                        selectedKey={formValue.unit as string | null}
                        onSelectionChange={onSelectionUnitChange}
                        isInvalid={!!formValueError.unit}
                        errorMessage={formValueError.unit as string}
                        itemToKey={(unit) => unit._id} // Map unit to its unique key
                        itemToLabel={(unit) => unit.name} // Map unit to its display label
                        inputWrapperClass={
                          formValueError.unit ? "border-0 bg-[#fee7ef]" : ""
                        }
                        className="mt-[32px]"
                      />
                      {accountList.length > 0 && (
                        <AutocompleteComponent
                          items={accountList as IAccount[]}
                          label="Interview Manager"
                          placeholder="Select a unit"
                          selectedKey={
                            formValue.interviewManager as string | null
                          }
                          onSelectionChange={onSelectionAccountChange}
                          isInvalid={!!formValueError.interviewManager}
                          errorMessage={
                            formValueError.interviewManager as string
                          }
                          itemToKey={(item) => item._id}
                          itemToLabel={(item) => item.name}
                          inputWrapperClass={
                            formValueError.interviewManager
                              ? "border-0 bg-[#fee7ef]"
                              : ""
                          }
                          className="mt-[32px]"
                        />
                      )}
                      <CustomEditor
                        handleChange={handleOnChange}
                        label="Job Description"
                        isRequired={true}
                        content={formValue.description}
                        isInvalid={!!formValueError.description}
                        errorMessage={formValueError.description}
                      />
                      <CustomEditor
                        handleChange={handleOnChange}
                        label="Requests"
                        isRequired={true}
                        content={formValue.requests}
                        isInvalid={!!formValueError.requests}
                        errorMessage={formValueError.requests}
                      />
                      <CustomEditor
                        handleChange={handleOnChange}
                        label="Benefits"
                        isRequired={true}
                        content={formValue.benefits}
                        isInvalid={!!formValueError.benefits}
                        errorMessage={formValueError.benefits}
                      />
                    </div>
                  </CardBody>
                </Card>
                <div className="flex items-end flex-col mb-4 relative mt-[32px]">
                  <Button
                    radius="full"
                    className="bg-gradient-to-tr from-themeOrange to-blurEffectGold text-themeWhite shadow-lg w-[174px] h-[44px]"
                    onClick={() => setActiveTab("Job Extra")} // Chuyển tab khi nhấn Next
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Tab>
              <Tab key="Job Extra" title="2. Job Extra Information">
                <Card>
                  <CardBody>
                    <div>
                      <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mt-[32px]">
                        <TextareaComponent
                          label="Work Address"
                          name="address"
                          // className="mt-[32px]"
                          labelPlacement="outside"
                          placeholder="Enter Work address of job"
                          value={formValue.address?.toString()}
                          onChange={(e) => onChange(e)}
                          endContent={
                            <MapPin
                              color={`${
                                formValueError.address ? "#f31260" : "#A1A1A9"
                              }`}
                            />
                          }
                          isInvalid={!!formValueError.address}
                          errorMessage={formValueError.address}
                        />
                        <AutocompleteComponent
                          items={types as { _id: string; name: string }[]}
                          label="Job Type"
                          placeholder="Select Job type"
                          selectedKey={formValue.type as string | null}
                          onSelectionChange={onSelectionTypeChange}
                          isInvalid={!!formValueError.type}
                          errorMessage={formValueError.type as string}
                          itemToKey={(type) => type._id}
                          itemToLabel={(type) => type.name}
                          inputWrapperClass={
                            formValueError.type ? "border-0 bg-[#fee7ef]" : ""
                          }
                        />
                      </div>
                      <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mt-[32px]">
                        <AutocompleteComponent
                          items={careerList as TCareer[]}
                          label="Career"
                          placeholder="Select Career"
                          selectedKey={formValue.career as string | null}
                          onSelectionChange={onSelectionCareerChange}
                          isInvalid={!!formValueError.career}
                          errorMessage={formValueError.career as string}
                          itemToKey={(career) => career._id} // Map career to unique key
                          itemToLabel={(career) => career.name} // Map career to display name
                          inputWrapperClass={
                            formValueError.career ? "border-0 bg-[#fee7ef]" : ""
                          }
                        />
                        <AutocompleteComponent
                          items={(unit?.locations ?? []) as TLocation[]}
                          label="Location"
                          placeholder="Select Location"
                          selectedKey={formValue.location as string | null}
                          onSelectionChange={onSelectionLocationChange}
                          isInvalid={!!formValueError.location}
                          errorMessage={formValueError.location as string}
                          itemToKey={(location) => location._id} // Map location to unique key
                          itemToLabel={(location) => location.city} // Map location to display city
                          inputWrapperClass={
                            formValueError.location
                              ? "border-0 bg-[#fee7ef]"
                              : ""
                          }
                        />
                      </div>
                      <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mt-[32px]">
                        <InputComponent
                          type="number"
                          isRequired
                          min={1}
                          label="Quantity"
                          name="numberPerson"
                          labelPlacement="outside"
                          placeholder="Add Quantity"
                          value={formValue.numberPerson?.toString() ?? ""}
                          onChange={onChange}
                          isInvalid={!!formValueError.numberPerson}
                          errorMessage={
                            formValueError.numberPerson?.toString() ?? ""
                          }
                        />
                        <DatePicker
                          label="Expired date"
                          labelPlacement="outside"
                          value={dateSelected}
                          onChange={onDateChange}
                          isInvalid={!!formValueError.expiredDate}
                          errorMessage={formValueError.expiredDate}
                        />
                      </div>

                      <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mt-[32px]">
                        <div className="relative flex-1">
                          <InputComponent
                            type="number"
                            isRequired
                            name="minSalary"
                            label="Min Budget"
                            labelPlacement="outside"
                            placeholder="Enter min budget"
                            min={0}
                            className="w-full"
                            value={formValue.minSalary?.toString() ?? ""}
                            onChange={onChange}
                            endContent={
                              <DollarSign
                                color={
                                  formValueError.minSalary
                                    ? "#f31260"
                                    : "#A1A1A9"
                                }
                              />
                            }
                            isInvalid={!!formValueError.minSalary}
                            errorMessage={
                              formValueError.minSalary?.toString() ?? ""
                            }
                          />
                        </div>
                        <div className="relative flex-1 mb-[38px]">
                          <InputComponent
                            type="number"
                            isRequired
                            name="maxSalary"
                            label="Max Budget"
                            labelPlacement="outside"
                            placeholder="Enter max budget"
                            min={0}
                            className="w-full"
                            value={formValue.maxSalary?.toString() ?? ""}
                            onChange={onChange}
                            disabled={
                              !formValue.minSalary && formValue.minSalary !== 0
                            }
                            endContent={
                              <DollarSign
                                color={
                                  formValueError.maxSalary
                                    ? "#f31260"
                                    : "#A1A1A9"
                                }
                              />
                            }
                            isInvalid={!!formValueError.maxSalary}
                            errorMessage={
                              formValueError.maxSalary?.toString() ?? ""
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <div className="flex items-center justify-between mb-4 relative mt-[32px] w-full">
                  <Button
                    radius="full"
                    color="primary"
                    variant="light"
                    className="bg-gradient-to-tr from-[#ccc] to-[#999] text-[#FFF] shadow-lg w-[174px] h-[44px]"
                    onClick={() => setActiveTab("Job Description")}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    onPress={handleSubmit}
                    radius="full"
                    className="bg-gradient-to-tr from-themeOrange to-blurEffectGold text-themeWhite shadow-lg w-[174px] h-[44px]"
                  >
                    Post Job
                  </Button>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
