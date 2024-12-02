import { IApply } from "@/api/applyApi";

export interface IStateProps {
  status: string;
  description?: string;
  applyId?: string;
  changeStatus?: ({ status }: { status: string }) => void;
  setLoadAgain?: (loadAgain: boolean) => void
  cv?: any
  meetingInfo?: any
  apply?: IApply
}
