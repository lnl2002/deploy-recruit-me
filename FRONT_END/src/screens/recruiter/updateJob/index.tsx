"use client";
import dynamic from "next/dynamic";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Button,
  DateValue,
  Accordion,
  AccordionItem,
  Checkbox,
} from "@nextui-org/react";
import { DatePicker } from "@nextui-org/date-picker";
import { ArrowLeft, ArrowRight, DollarSign, MapPin, X } from "lucide-react";
import {
  parseAbsoluteToLocal,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
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
import groupCriteriaApi, { IGroupCriteria } from "@/api/groupCriteriaApi";
import { ICriteria, ICriteriaDetails } from "@/api/criteriaApi";
import { title } from "process";
import CriteriaDetail from "./criteriaDetail";
import { isEmpty } from "@/utils/isEmpty";

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

const LEVELs = ["BASIC", "BEGINER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

const types: JobType[] = [
  { _id: "fulltime", name: "Fulltime" },
  { _id: "parttime", name: "Parttime" },
  { _id: "hybrid", name: "Hybrid" },
  { _id: "remote", name: "Remote" },
  { _id: "remote-fulltime", name: "Remote Fulltime" },
  { _id: "remote-parttime", name: "Remote Parttime" },
];

// type TCriteriaSelected = {
//   groupCriteriaId: string;
//   criteria: ICriteria;
// };

interface PageProps {
  jobId: string;
}

export const UpdateJob: React.FC<PageProps> = ({
  jobId,
}): React.JSX.Element => {
  const router = useRouter();
  const { userInfo } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("Job Description");
  const [formValue, setFormValue] = useState<Partial<TJob>>({});
  const [formValueError, setFormValueError] = useState<Partial<TJob>>({});
  const [unitList, setUnitList] = useState<TUnit[]>([]);
  const [groupCriterias, setGroupCriterias] = useState<IGroupCriteria[]>([]);
  const [groupCriteriasSelected, setGroupCriteriasSelected] =
    useState<string>("");
  const [criterias, setCriterias] = useState<ICriteria[]>([]);
  const [criteriasSelected, setCriteriasSelected] = useState<ICriteria[]>([]);
  const [unit, setUnit] = useState<Partial<TUnit>>({});
  const [careerList, setCareerList] = useState<TCareer[]>([]);
  const [accountList, setAccountList] = useState<IAccount[]>([]);
  const [dateStartSelected, setDateStartSelected] =
    useState<DateValue | null>();
  const [dateExpriredSelected, setDateExpriredSelected] =
    useState<DateValue | null>();

  useEffect(() => {
    if (userInfo?.role !== "RECRUITER") {
      toast.error("You don't have permission to access this page.");
      router.back();
    }
  }, [userInfo]);

  useEffect(() => {
    (async () => {
      const { job } = await jobApi.getJobById(jobId);

      if (!job) {
        toast.error("Job not found.");
        router.push("/recruiter/list-jobs");
        return;
      }
      setFormValue({
        ...job,
        career: (job.career as TCareer)._id,
        interviewManager: (job.interviewManager as IAccount)._id,
        account: (job.account as IAccount)._id,
        location: (job.location as TLocation)._id,
        unit: (job.unit as TUnit)._id,
      });
      setCriteriasSelected(job.criterias as ICriteria[]);
    })();
  }, [jobId]);

  useEffect(() => {
    (async () => {
      const { units } = await unitApi.getUnitList();
      const { careers } = await careerApi.getCareerList();
      setUnitList(units);
      setCareerList(careers);
    })();
  }, []);

  useEffect(() => {
    console.log(formValue);
  }, [formValue]);

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

      if (!isEmpty(groupCriterias)) {
        setGroupCriterias(groupCriterias);
        setGroupCriteriasSelected(groupCriterias[0]._id);
      }
    })();
  }, [formValue?.unit]);

  useEffect(() => {
    (async () => {
      if (!groupCriteriasSelected) return;

      const { groupCriteria } = await groupCriteriaApi.getGroupCriteria(
        groupCriteriasSelected
      );

      if (groupCriteria) {
        setCriterias(groupCriteria.criterias as ICriteria[]);
      }
    })();
  }, [groupCriteriasSelected]);

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

  const onDateChange =
    (field: "startDate" | "expiredDate") => (value: DateValue) => {
      // Chuyển đổi giá trị được chọn thành Date
      const date = new Date(value.year, value.month - 1, value.day); // Không có thời gian
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Đặt thời gian hiện tại về đầu ngày

      // Kiểm tra nếu ngày đã chọn là ngày trong quá khứ
      if (today.getTime() > date.getTime()) {
        setFormValueError((prev) => ({
          ...prev,
          [field]: "Please select a date after the current date!",
        }));
        setFormValue((prev) => ({
          ...prev,
          [field]: "",
        }));
        if (field === "startDate") {
          setDateStartSelected(null);
        } else {
          setDateExpriredSelected(null);
        }
        return;
      }

      // Kiểm tra logic giữa startDate và expiredDate
      if (field === "startDate") {
        if (formValue.expiredDate) {
          const expiredDate = new Date(formValue.expiredDate);
          expiredDate.setHours(0, 0, 0, 0);
          if (date.getTime() > expiredDate.getTime()) {
            setFormValueError((prev) => ({
              ...prev,
              startDate: "Start date cannot be after expiration date!",
            }));
            setFormValue((prev) => ({
              ...prev,
              startDate: "",
            }));
            setDateStartSelected(null);
            return;
          }
        }
      } else if (field === "expiredDate") {
        if (formValue.startDate) {
          const startDate = new Date(formValue.startDate);
          startDate.setHours(0, 0, 0, 0); // Đặt về đầu ngày
          if (date.getTime() <= startDate.getTime()) {
            setFormValueError((prev) => ({
              ...prev,
              expiredDate:
                "Expiration date cannot be before or equal start date!",
            }));
            setFormValue((prev) => ({
              ...prev,
              expiredDate: "",
            }));
            setDateExpriredSelected(null);
            return;
          }
        }
      }

      // Xóa lỗi nếu ngày hợp lệ
      setFormValueError((prev) => ({
        ...prev,
        [field]: "",
      }));

      // Cập nhật giá trị ngày
      setFormValue(
        (prev): Partial<TJob> => ({
          ...prev,
          [field]: date.toISOString(),
        })
      );

      // Cập nhật giá trị selected
      if (field === "startDate") {
        setDateStartSelected(value);
      } else {
        setDateExpriredSelected(value);
      }
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
    if (criteriasSelected.length === 0) {
      toast.warning("Please select at least one criteria");
      return;
    }

    for (const field of requiredFields) {
      if (isEmpty(formValue[field as keyof TJob])) {
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

    if (formValue["numberPerson"] === 0) {
      setFormValueError((pre) => ({
        ...pre,
        ["numberPerson" as keyof TJob]: "Please enter a value greater than 0!",
      }));
    }

    const missingFields = requiredFields.filter(
      (field) => !isEmpty(formValueError[field as keyof TJob])
    );

    if (missingFields.length > 0) {
      toast.warning("Please add all missing fields");
      return;
    }

    const criteriaIds = criteriasSelected.map((criteria) => criteria._id);

    const { job: newJob } = await jobApi.updateJob(jobId, {
      ...formValue,
      criterias: criteriaIds,
    });

    if (newJob?._id) {
      toast.success("Update job successfully");
      router.push("/recruiter/list-job");
    } else toast.error("Error updating job!");
  };

  const handleSelectedCriterias =
    (criteria: ICriteria) => (isSelected: boolean) => {
      if (isSelected) {
        setCriteriasSelected((prevs) => [...prevs, criteria]);
      } else {
        setCriteriasSelected((prevs) =>
          prevs.filter((criteriaPrev) => !(criteriaPrev._id === criteria._id))
        );
      }
    };

  const handleDeleteSelectedCriterias = (criteria: ICriteria) => () => {
    setCriteriasSelected((prevs) => {
      const newArr = prevs.filter(
        (criteriaPrev) => !(criteriaPrev._id === criteria._id)
      );
      if (newArr.length === 0) {
        setActiveTab("Job Criteria");
      }
      return newArr;
    });
  };

  if (Object.keys(formValue).length === 0) {
    return <div>la</div>;
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center">
      <div className="w-[68vw] flex-1 bg-white">
        <div className="mt-[60px]">
          <h1 className="mb-[4px] text-3xl font-medium text-[#999]">
            Update a job
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
                      <AutocompleteComponent
                        items={accountList}
                        props={{ isDisabled: accountList.length === 0 }}
                        label="Interview Manager"
                        placeholder="Select a unit"
                        selectedKey={
                          formValue.interviewManager as string | null
                        }
                        onSelectionChange={(value: Key | null) => {
                          onSelectedChange("interviewManager", value);
                        }}
                        isInvalid={!!formValueError.interviewManager}
                        errorMessage={formValueError.interviewManager as string}
                        itemToKey={(item) => item._id}
                        itemToLabel={(item) => item.name}
                        inputWrapperClass={
                          formValueError.interviewManager
                            ? "border-0 bg-[#fee7ef]"
                            : ""
                        }
                        className="mt-[32px]"
                      />
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
                      if (!formValue.interviewManager) {
                        toast.warning("Please select a interview manager");
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
                          maxRows={2}
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
                      </div>
                      <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mt-[32px]">
                        <AutocompleteComponent
                          items={careerList}
                          label="Career"
                          placeholder="Select Career"
                          selectedKey={formValue.career as string | null}
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
                        <AutocompleteComponent
                          items={types as { _id: string; name: string }[]}
                          label="Job Type"
                          placeholder="Select Job type"
                          selectedKey={formValue.type as string | null}
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
                        <DatePicker
                          label="Start date"
                          labelPlacement="outside"
                          value={dateStartSelected}
                          onChange={onDateChange("startDate")}
                          isInvalid={!!formValueError.startDate}
                          errorMessage={formValueError.startDate}
                          defaultValue={parseAbsoluteToLocal(
                            formValue?.startDate ?? getLocalTimeZone()
                          )}
                          granularity="day"
                        />
                        <DatePicker
                          label="Expired date"
                          labelPlacement="outside"
                          value={dateExpriredSelected}
                          onChange={onDateChange("expiredDate")}
                          isInvalid={!!formValueError.expiredDate}
                          errorMessage={formValueError.expiredDate}
                          defaultValue={parseAbsoluteToLocal(
                            formValue?.expiredDate ?? getLocalTimeZone()
                          )}
                          granularity="day"
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
                      label="Group Criteria"
                      placeholder="Select Group Criteria"
                      selectedKey={groupCriteriasSelected as string | null}
                      onSelectionChange={(value: Key | null) => {
                        setGroupCriteriasSelected(value?.toString() as string);
                      }}
                      itemToKey={(criteria) => criteria._id}
                      itemToLabel={(criteria) => criteria.name}
                    />
                    <Accordion>
                      {criterias.map((criteria) => (
                        <AccordionItem
                          key={criteria._id}
                          aria-label={criteria?.name}
                          title={criteria?.name}
                          startContent={
                            <Checkbox
                              isSelected={criteriasSelected.some(
                                (item) => item?._id === criteria._id
                              )}
                              onValueChange={handleSelectedCriterias(criteria)}
                              aria-label={criteria?.name}
                            ></Checkbox>
                          }
                        >
                          <CriteriaDetail criteria={criteria} />
                        </AccordionItem>
                      ))}
                    </Accordion>
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
                    radius="full"
                    color="primary"
                    variant="light"
                    className="bg-gradient-to-tr from-themeOrange to-blurEffectGold text-themeWhite shadow-lg w-[174px] h-[44px]"
                    onClick={() => {
                      if (criteriasSelected.length === 0) {
                        toast.warning("Please select at least one criteria");
                        return;
                      }
                      setActiveTab("Criteria Details");
                    }}
                    endContent={<ArrowRight size={20} />}
                  >
                    Next
                  </Button>
                </div>
              </Tab>
              <Tab key="Criteria Details" title="4. Criteria Details">
                <Card className="min-h-72">
                  <CardBody className="mt-5 gap-3">
                    <p className="text-2xl font-bold">
                      List criteria for {formValue.title}
                    </p>
                    <Accordion>
                      {criteriasSelected.map((criteria) => (
                        <AccordionItem
                          key={criteria?._id}
                          aria-label={criteria?.name}
                          title={criteria?.name}
                          indicator={
                            <Button
                              radius="full"
                              className="bg-gradient-to-tr from-[#ff4c28] to-[#FFF] text-themeWhite shadow-lg"
                              isIconOnly={true}
                              onPress={handleDeleteSelectedCriterias(criteria)}
                            >
                              <X size={18} aria-label={criteria?.name} />
                            </Button>
                          }
                        >
                          <CriteriaDetail criteria={criteria} />
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardBody>
                </Card>
                <div className="flex items-center justify-between mb-4 relative mt-[32px] w-full">
                  <Button
                    radius="full"
                    color="primary"
                    variant="light"
                    className="bg-gradient-to-tr from-[#ccc] to-[#999] text-[#FFF] shadow-lg w-[174px] h-[44px]"
                    onClick={() => setActiveTab("Job Criteria")}
                    startContent={<ArrowLeft size={20} />}
                  >
                    Back
                  </Button>
                  <Button
                    onPress={handleSubmit}
                    radius="full"
                    className="bg-gradient-to-tr from-themeOrange to-blurEffectGold text-themeWhite shadow-lg w-[174px] h-[44px]"
                  >
                    Update Job
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
