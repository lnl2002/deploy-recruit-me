export interface IStateProps {
  status: string;
  description?: string;
  applyId?: string;
  changeStatus?: ({ status }: { status: string }) => void;
}
