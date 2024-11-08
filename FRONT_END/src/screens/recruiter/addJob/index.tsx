"use client";
import dynamic from "next/dynamic";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Button,
  DateValue,
} from "@nextui-org/react";
import { DatePicker } from "@nextui-org/date-picker";
import {
  ArrowLeft,
  ArrowRight,
  CircleMinus,
  CirclePlus,
  DollarSign,
  MapPin,
  SquareMinus,
} from "lucide-react";
import { Key, useEffect, useState } from "react";
import unitApi, { TUnit } from "@/api/unitApi";
import accountApi, { IAccount } from "@/api/accountApi/accountApi";
import jobApi, { TJob } from "@/api/jobApi";
import careerApi, { TCareer } from "@/api/careerApi";
import { TLocation } from "@/api/locationApi";
import AutocompleteComponent from "./select";
import InputComponent from "./input";
import TextareaComponent from "./textarea";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/store";
import criteriaApi, { ICritera } from "@/api/criteriaApi";

const CustomEditor = dynamic(() => import("./custom"), {
  ssr: false,
});

const requiredFields = [
  "title",
  "description",
  "requests",
  "benefits",
  "unit",
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

interface ICriteraDetails {
  criteriaName: string;
  errorMessageName?: string;
  requirement: string;
  errorMessageRequirement?: string;
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
  const router = useRouter();
  const { userInfo } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("Job Description");
  const [formValue, setFormValue] = useState<Partial<TJob>>({});
  const [formValueError, setFormValueError] = useState<Partial<TJob>>({});
  const [unitList, setUnitList] = useState<Partial<TUnit[]> | []>([]);
  const [criteriaList, setCriteriaList] = useState<Partial<ICritera[]>>([]);
  const [unit, setUnit] = useState<Partial<TUnit>>({});
  const [careerList, setCareerList] = useState<Partial<TCareer[]> | []>([]);
  const [accountList, setAccountList] = useState<Partial<IAccount[]> | []>([]);
  const [dateSelected, setDateSelected] = useState<DateValue | null>();
  const [amountCriteria, setAmountCriteria] = useState<number>(1);
  const [criteriaArray, setCriteriaArray] = useState<ICriteraDetails[]>([]);

  useEffect(() => {
    if (userInfo?.role !== "RECRUITER") {
      toast.error("You don't have permission to access this page.");
      router.back();
    }
  }, [userInfo]);

  useEffect(() => {
    (async () => {
      const { units } = await unitApi.getUnitList();
      const { careers } = await careerApi.getCareerList();
      setUnitList(units);
      setCareerList(careers);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!formValue?.unit) return;

      const params = `&unit=${
        formValue?.unit as string
      }&role=${"6718eb41b203b7efd13871ca"}`;
      const { accounts } = await accountApi.getListAccount(params);
      const { unit } = await unitApi.getUnit(formValue?.unit as string);
      setUnit(unit);
      setAccountList(accounts);
    })();
  }, [formValue?.unit]);

  useEffect(() => {
    (async () => {
      if (!formValue?.career) return;

      const params = `?career=${formValue?.career as string}`;
      const { criterias } = await criteriaApi.getCareerList(params);

      setCriteriaList(criterias);
    })();
  }, [formValue?.career]);

  useEffect(() => {
    console.log(formValue);
  }, [formValue]);

  useEffect(() => {
    setCriteriaArray((prev) =>
      Array.from({ length: amountCriteria }).map((_, index) => ({
        criteriaName: prev[index]?.criteriaName ?? "",
        errorMessageName: prev[index]?.errorMessageName ?? "",
        requirement: prev[index]?.requirement ?? "",
        errorMessageRequirement: prev[index]?.errorMessageRequirement ?? "",
      }))
    );
  }, [amountCriteria]);

  const handleRequirementChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = event.target;
    setCriteriaArray((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, requirement: value, errorMessageName: "" }
          : item
      )
    );
  };

  const onSelectionCriteriaChange = (
    key: Key | null,
    criteriaIndex: number
  ) => {
    const value = key?.toString();
    const obj: any = {};
    if (value) {
      obj.criteriaName = value;
      obj.errorMessageName = "";
      const checkExist = criteriaArray.some(
        (criteria, index) =>
          criteria.criteriaName === value && index !== criteriaIndex
      );
      if (checkExist) {
        obj.errorMessageName = "This criterion is already added";
      }
    } else {
      obj.criteriaName = "";
      obj.errorMessageName = "";
    }

    setCriteriaArray((prev) =>
      prev.map((item, i) => (i === criteriaIndex ? { ...item, ...obj } : item))
    );
  };

  const handleDeleteCriteria = (index: number) => {
    setCriteriaArray((prev) => prev.filter((_, i) => i !== index));
    setAmountCriteria((prev) => prev - 1);
  };

  const handleOnChange = (value: string, label: string) => {
    setFormValue(
      (pre): Partial<TJob> => ({
        ...pre,
        [label as keyof TJob]: value ?? pre?.[label as keyof TJob],
      })
    );
    setFormValueError(
      (pre): Partial<TJob> => ({ ...pre, [label as keyof TJob]: "" })
    );
  };

  const onSelectedChange = (key: string, value: Key | null) => {
    const parseValue = value?.toString();
    setFormValue(
      (pre): Partial<TJob> => ({
        ...pre,
        [key as keyof TJob]: parseValue,
      })
    );
    setFormValueError(
      (pre): Partial<TJob> => ({ ...pre, [key as keyof TJob]: "" })
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

    let errorMessage = "";
    const minSalary = formValue?.minSalary;
    if (name === "maxSalary" && minSalary) {
      if ((parsedValue as number) < minSalary) {
        errorMessage =
          "Maximum salary must be greater than or equal to minimum salary";
      }
    }

    setFormValueError(
      (pre): Partial<TJob> => ({ ...pre, [name as keyof TJob]: errorMessage })
    );
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

    setCriteriaArray((prevArr) =>
      prevArr.map((field) => ({
        ...field,
        errorMessageName: !field.criteriaName.trim()
          ? "Criteria name is required."
          : "",
        errorMessageRequirement: !field.requirement.trim()
          ? "Requirement is required."
          : "",
      }))
    );

    const emptyFieldCriteriaQtt = criteriaArray.some(
      (criteria) =>
        !criteria.criteriaName.trim() || !criteria.requirement.trim()
    );
    if (criteriaArray.length === 0) {
      toast.warning("Please add at least one criteria");
      return;
    }

    if (missingFields.length > 0 || emptyFieldCriteriaQtt) {
      toast.warning("Please add all missing fields");
      return;
    }

    const { job: newJob } = await jobApi.addJob({
      ...formValue,
      criterias: criteriaArray,
    });

    if (newJob?._id) {
      toast.success("Add job successfully");
      router.push("/recruiter/list-job");
    } else toast.error("Error creating job!");
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center">
      <div className="w-[68vw] flex-1 bg-white">
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
                        maxRows={1}
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
                        onSelectionChange={(value: Key | null) => {
                          onSelectedChange("unit", value);
                        }}
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
                          // onSelectionChange={onSelectionAccountChange}
                          onSelectionChange={(value: Key | null) => {
                            onSelectedChange("interviewManager", value);
                          }}
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
                        label="Description"
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
                    onClick={() => {
                      if (!formValue.unit) {
                        toast.warning("Please select a unit");
                        return;
                      }
                      setActiveTab("Job Extra");
                    }} // Chuyển tab khi nhấn Next
                    endContent={<ArrowRight size={20} />}
                  >
                    Next
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
                          maxRows={1}
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
                          // onSelectionChange={onSelectionTypeChange}
                          onSelectionChange={(value: Key | null) => {
                            onSelectedChange("type", value);
                          }}
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
                          // onSelectionChange={onSelectionCareerChange}
                          onSelectionChange={(value: Key | null) => {
                            onSelectedChange("career", value);
                          }}
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
                          // onSelectionChange={onSelectionLocationChange}
                          onSelectionChange={(value: Key | null) => {
                            onSelectedChange("location", value);
                          }}
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
                    startContent={<ArrowLeft size={20} />}
                  >
                    Back
                  </Button>
                  <Button
                    onPress={() => {
                      if (!formValue.career) {
                        toast.warning("Please select a career");
                        return;
                      }
                      setActiveTab("Job Criteria");
                    }}
                    radius="full"
                    className="bg-gradient-to-tr from-themeOrange to-blurEffectGold text-themeWhite shadow-lg w-[174px] h-[44px]"
                    endContent={<ArrowRight size={20} />}
                  >
                    Next
                  </Button>
                </div>
              </Tab>
              <Tab key="Job Criteria" title="3. Job Criteria">
                <Card className="min-h-72">
                  <CardBody className="mt-5 gap-3">
                    {Array.from({ length: amountCriteria }).map((_, index) => (
                      <div className="flex flex-row gap-5 mt-5" key={index}>
                        <div className="flex items-center">
                          <Button
                            isIconOnly={true}
                            radius="full"
                            className="bg-themeWhite"
                            onPress={() => handleDeleteCriteria(index)}
                          >
                            <CircleMinus size={18} color="#f70707" />
                          </Button>
                        </div>
                        <AutocompleteComponent
                          items={criteriaList as ICritera[]}
                          label={`Criterion ${index + 1}`}
                          placeholder="Select a criterion"
                          selectedKey={
                            criteriaArray[index]?.criteriaName as string | null
                          }
                          onSelectionChange={(key: Key | null) =>
                            onSelectionCriteriaChange(key, index)
                          }
                          isInvalid={!!criteriaArray[index]?.errorMessageName}
                          errorMessage={criteriaArray[index]?.errorMessageName}
                          itemToKey={(criteria) => criteria.name}
                          itemToLabel={(criteria) => criteria.name}
                          inputWrapperClass={
                            criteriaArray[index]?.errorMessageName
                              ? "border-0 bg-[#fee7ef]"
                              : ""
                          }
                        />
                        <TextareaComponent
                          label={`Requirements ${index + 1}`}
                          name="requirements"
                          labelPlacement="outside"
                          placeholder="Add Job requirements"
                          value={criteriaArray[index]?.requirement}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => handleRequirementChange(event, index)}
                          isDisabled={!criteriaArray[index]?.criteriaName}
                          classNames={{ label: "pb-[4px]" }}
                          isInvalid={
                            !!criteriaArray[index]?.errorMessageRequirement
                          }
                          errorMessage={
                            criteriaArray[index]?.errorMessageRequirement
                          }
                        />
                      </div>
                    ))}
                    <Button
                      size="sm"
                      onPress={() => setAmountCriteria((prev) => prev + 1)}
                      className="w-fit bg-blurEffectWhite mt-6 mb-3"
                      startContent={<CirclePlus color="#f16e21" size={20} />}
                    >
                      <p className="text-themeOrange text-md">
                        Add new Criterion
                      </p>
                    </Button>
                  </CardBody>
                </Card>
                <div className="flex items-center justify-between mb-4 relative mt-[32px] w-full">
                  <Button
                    radius="full"
                    color="primary"
                    variant="light"
                    className="bg-gradient-to-tr from-[#ccc] to-[#999] text-[#FFF] shadow-lg w-[174px] h-[44px]"
                    onClick={() => setActiveTab("Job Extra")}
                  >
                    <ArrowLeft size={20} />
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
