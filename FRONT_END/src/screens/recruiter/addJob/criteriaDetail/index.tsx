import { ICriteria, ICriteriaDetails } from "@/api/criteriaApi";
import {
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Table,
} from "@nextui-org/react";

const LEVELs = ["BASIC", "BEGINER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

type CriteriaDetailProps = {
  criteria: ICriteria;
};

const CriteriaDetail: React.FC<CriteriaDetailProps> = ({ criteria }) => {
  return (
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
            <TableCell className="font-bold">{level}</TableCell>
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
  );
};

export default CriteriaDetail;
