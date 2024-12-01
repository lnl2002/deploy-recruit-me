import { IAccount } from "@/api/accountApi/accountApi";
import { IApplicantReport } from "@/api/applicantReportApi";
import ModalConfirm from "@/components/Modals/ModalConfirm";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Tab,
  Tabs,
  useDisclosure,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";

type Props = {
  changeStatus?: ({ status }: { status: string }) => void;
  filter: {
    status: string;
    sort: string;
  };
  data: IApplicantReport[];
};
const InteviewNotes = ({ changeStatus, filter, data }: Props) => {
  const [isConfirm, setIsConfirm] = useState<boolean>(false);
  const [btnChoosed, setButtonChoosed] = useState<string>("");
  const [users, setUsers] = useState<IAccount[]>([]);
  const [reports, setReports] = useState<IApplicantReport[]>(data || []);
  const disclosure = useDisclosure();

  const handleClickButton = (updateStatus: string) => {
    setButtonChoosed(updateStatus);
    disclosure.onOpen();
  };

  useEffect(() => {
    if (isConfirm && changeStatus) {
      changeStatus({ status: btnChoosed });
      disclosure.onClose();
    }
  }, [isConfirm]);

  useEffect(() => {
    setReports(data);
  }, [data]);

  useEffect(() => {
    const createdBys = reports?.map((report) => report.createdBy as IAccount);
    setUsers(createdBys);
  }, [reports]);

  return (
    <div className="flex w-full flex-col mt-5">
      <Tabs
        aria-label="Options"
        color="primary"
        variant="bordered"
        radius="full"
        classNames={{
          cursor: "bg-themeOrange !text-[#fff]",
        }}
      >
        {reports &&
          reports.map((report) => (
            <Tab
              key={(report?.createdBy as IAccount)?._id.toString()}
              title={
                <div className="flex items-center space-x-2">
                  <Avatar
                    size="sm"
                    src={(report?.createdBy as IAccount)?.image}
                    alt={(report?.createdBy as IAccount)?.name}
                  />
                  <span>{(report?.createdBy as IAccount)?.name}</span>
                </div>
              }
            >
              <Card className="max-h-[78vh] overflow-y-auto">
                <CardBody>
                  <div className="text-[20px] mb-8">
                    <span className="contents">Score:</span>
                    <span className="contents text-themeOrange font-bold ">
                      {" "}
                      {report?.score || 0}
                    </span>
                    <span className="contents">/10</span>
                  </div>
                  {report?.details &&
                    report?.details?.map((detail, index) => (
                      <div className="mb-5">
                        <div className="font-bold">
                          <span className="mr-3">{index + 1}.</span>{detail.criteriaName}
                        </div>
                        <div className="pl-[25px] mt-2">
                          {detail.comment || 'None'}
                        </div>
                      </div>
                    ))}
                </CardBody>
              </Card>
            </Tab>
          ))}
      </Tabs>
      {!["Rejected", "Accepted"].includes(filter.status) && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
            radius="full"
            onClick={() => handleClickButton("Rejected")}
          >
            Reject
          </Button>
          <Button
            className="bg-themeOrange text-[#fff]"
            radius="full"
            onClick={() => handleClickButton("Accepted")}
          >
            Accept
          </Button>
        </div>
      )}
      <ModalConfirm
        title={`Are you sure you want to change to status </br><strong>${
          btnChoosed === "Accepted" ? "Accept" : "Reject"
        }</strong>?`}
        description="You can not be undone !!"
        disclosure={disclosure}
        onCloseModal={() => setIsConfirm(false)}
        onConfirm={() => setIsConfirm(true)}
      />
    </div>
  );
};

export default InteviewNotes;
