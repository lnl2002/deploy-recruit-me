"use client";
import dynamic from "next/dynamic";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Button,
  DateValue,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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
import { Fragment, Key, useEffect, useState } from "react";
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
import groupCriteriaApi, { IGroupCriteria } from "@/api/groupCriteriaApi";
import { ICriteria, ICriteriaDetails } from "@/api/criteriaApi";

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
  "groupCriteria",
];

interface JobType {
  _id: string;
  name: string;
}

const LEVELs = ["BASIC", "BEGINER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

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
  const [unitList, setUnitList] = useState<TUnit[]>([]);
  const [groupCriterias, setGroupCriterias] = useState<IGroupCriteria[]>([]);
  const [criterias, setCriterias] = useState<ICriteria[]>([]);
  const [unit, setUnit] = useState<Partial<TUnit>>({});
  const [careerList, setCareerList] = useState<TCareer[]>([]);
  const [accountList, setAccountList] = useState<IAccount[]>([]);
  const [dateSelected, setDateSelected] = useState<DateValue | null>();

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
      if (!formValue?.unit) return;

      const params = `?unit=${formValue?.unit as string}`;
      const { groupCriterias } = await groupCriteriaApi.getGroupCriterias(
        params
      );

      setGroupCriterias(groupCriterias);
    })();
  }, [formValue?.unit]);

  useEffect(() => {
    (async () => {
      if (!formValue?.groupCriteria) return;

      const { groupCriteria } = await groupCriteriaApi.getGroupCriteria(
        formValue?.groupCriteria as string
      );

      if (groupCriteria) setCriterias(groupCriteria.criterias as ICriteria[]);
    })();
  }, [formValue?.groupCriteria]);

  useEffect(() => {
    console.log(criterias);
  }, [criterias]);

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

    if (missingFields.length > 0) {
      toast.warning("Please add all missing fields");
      return;
    }

    const { job: newJob } = await jobApi.addJob(formValue);

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
                        items={unitList}
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
                          items={accountList}
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
                    <AutocompleteComponent
                      items={groupCriterias}
                      label="Criteria Name"
                      placeholder="Select Criteria Name"
                      selectedKey={formValue.groupCriteria as string | null}
                      onSelectionChange={(value: Key | null) => {
                        onSelectedChange("criteria", value);
                      }}
                      isInvalid={!!formValueError.groupCriteria}
                      errorMessage={formValueError.groupCriteria as string}
                      itemToKey={(criteria) => criteria._id}
                      itemToLabel={(criteria) => criteria.name}
                      inputWrapperClass={
                        formValueError.groupCriteria
                          ? "border-0 bg-[#fee7ef]"
                          : ""
                      }
                    />
                    {criterias.map((criteria) => (
                      <Fragment key={criteria?._id}>
                        <div className="px-4 pb-1 pt-2">
                          <span className="font-semibold">
                            {criteria?.name}
                          </span>
                        </div>
                        <Table
                          hideHeader={true}
                          className="table-fixed"
                          aria-label="Vertical Header table"
                        >
                          <TableHeader>
                            <TableColumn>LEVEL</TableColumn>
                            <TableColumn>CRITERIA</TableColumn>
                            <TableColumn>WEIGHT</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {LEVELs.map((level) => (
                              <TableRow key={level}>
                                <TableCell className="font-bold">
                                  {level}
                                </TableCell>
                                <TableCell>
                                  {(
                                    criteria[
                                      level.toLowerCase() as keyof ICriteria
                                    ] as ICriteriaDetails
                                  )?.detail ?? ""}
                                </TableCell>
                                <TableCell className="w-16">
                                  {(
                                    criteria[
                                      level.toLowerCase() as keyof ICriteria
                                    ] as ICriteriaDetails
                                  )?.weight ?? ""}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Fragment>
                    ))}
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
