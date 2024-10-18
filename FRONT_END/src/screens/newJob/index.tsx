"use client";

import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Button,
  DatePicker,
} from "@nextui-org/react";
import { ArrowLeft, ArrowRight, DollarSign, MapPin } from "lucide-react";
import { useState } from "react";

const NewJob = () => {
  const [activeTab, setActiveTab] = useState("Job Description"); // Trạng thái tab hiện tại
  const companies = [
    { value: "apple", label: "Apple" },
    { value: "google", label: "Google" },
    { value: "microsoft", label: "Microsoft" },
    { value: "amazon", label: "Amazon" },
    { value: "facebook", label: "Facebook" },
    { value: "tesla", label: "Tesla" },
    { value: "netflix", label: "Netflix" },
  ];

  return (
    <div className="w-screen h-screen max-w-[1440px] mx-auto">
      <header className="h-[96px] bg-gray-200 flex items-center justify-center">
        header
      </header>

      <div className="flex-grow flex items-center justify-center">
        <div className="w-[1200px] h-[1173px] bg-white px-[204px]">
          <div className="mt-[60px]">
            <h1 className="mb-[4px] text-3xl font-medium text-gray-900">
              Post a new job
            </h1>
            <p className="text-gray-500 text-base">
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
                <Tab
                  key="Job Description"
                  title="1. Job Description Information"
                >
                  <Card>
                    <CardBody>
                      <div>
                        <Textarea
                          isRequired
                          label="Job Title"
                          labelPlacement="outside"
                          placeholder="Add Job Title"
                          className="mt-[32px]"
                          maxRows={1}
                        />
                        <Autocomplete
                          isRequired
                          defaultItems={companies}
                          label="Unit"
                          placeholder="FPT Polytechnic College High School"
                          className="mt-[32px]"
                          labelPlacement="outside"
                          variant="faded"
                        >
                          {(companies) => (
                            <AutocompleteItem key={companies.value}>
                              {companies.label}
                            </AutocompleteItem>
                          )}
                        </Autocomplete>
                        <Textarea
                          isRequired
                          label="Job Description"
                          labelPlacement="outside"
                          placeholder="Add Job Description"
                          className="mt-[32px]"
                          maxRows={4}
                        />
                        <Textarea
                          isRequired
                          label="Request"
                          labelPlacement="outside"
                          placeholder="Add Request of job"
                          className="mt-[32px]"
                          maxRows={4}
                        />
                        <Textarea
                          isRequired
                          label="Benefits"
                          labelPlacement="outside"
                          placeholder="Add Benefits of job"
                          className="mt-[32px] mb-[45px]"
                          maxRows={4}
                        />
                      </div>
                    </CardBody>
                  </Card>
                  <div className="flex items-end flex-col mb-4 relative mt-[32px]">
                    <Button
                      radius="full"
                      className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg w-[174px] h-[44px]"
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
                        <div className="relative mt-[32px]">
                          <Textarea
                            isRequired
                            label="Work Address"
                            labelPlacement="outside"
                            placeholder="Enter Work address of job"
                            maxRows={1}
                          />
                          <MapPin
                            style={{ top: "34px", right: "9px" }}
                            className="absolute top-2 right-3 text-gray-500 pointer-events-none"
                          />
                        </div>
                        <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mt-[32px]">
                          <Autocomplete
                            isRequired
                            defaultItems={companies}
                            label="Job Type"
                            placeholder="Select Job type"
                            labelPlacement="outside"
                            className="max-w"
                          >
                            {companies.map((companie) => (
                              <AutocompleteItem
                                key={companie.value}
                                value={companie.value}
                              >
                                {companie.label}
                              </AutocompleteItem>
                            ))}
                          </Autocomplete>
                          <Autocomplete
                            isRequired
                            defaultItems={companies}
                            label="Occupation"
                            placeholder="Select Occupation"
                            labelPlacement="outside"
                            className="max-w"
                          >
                            {(item) => (
                              <AutocompleteItem key={item.value}>
                                {item.label}
                              </AutocompleteItem>
                            )}
                          </Autocomplete>
                        </div>
                        <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mt-[32px]">
                          <Textarea
                            isRequired
                            label="Quantity"
                            labelPlacement="outside"
                            placeholder="Add Quantity"
                            maxRows={1}
                          />

                          <DatePicker
                            label="Birth date"
                            labelPlacement="outside"
                          />
                        </div>

                        <div className="flex w-full flex-wrap md:flex-nowrap gap-4 mt-[32px]">
                          <div className="relative flex-1">
                            <Textarea
                              isRequired
                              label="Min Budget"
                              labelPlacement="outside"
                              placeholder="Enter min budget"
                              maxRows={1}
                              className="w-full"
                            />
                            <DollarSign
                              style={{ top: "34px", right: "9px" }}
                              className="absolute top-2 right-3 text-gray-500 pointer-events-none"
                            />
                          </div>
                          <div className="relative flex-1 mb-[38px]">
                            <Textarea
                              isRequired
                              label="Max Budget"
                              labelPlacement="outside"
                              placeholder="Enter max budget"
                              maxRows={1}
                              className="w-full"
                            />
                            <DollarSign
                              style={{ top: "34px", right: "9px" }}
                              className="absolute top-2 right-3 text-gray-500 pointer-events-none"
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
                      className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg w-[174px] h-[44px]"
                      onClick={() => setActiveTab("Job Description")} // Chuyển tab khi nhấn Back
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      radius="full"
                      className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg w-[174px] h-[44px]"
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

      <footer className="h-[325px] bg-gray-300 flex items-center justify-center">
        footer
      </footer>
    </div>
  );
};

export default NewJob;