import { FC } from "react";
import { ICriteria } from "@/api/criteriaApi";
import { TJob } from "@/api/jobApi";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import { ChevronDown, Eye, EyeOff, X } from "lucide-react";
import CriteriaDetail from "@/components/criteriaDetail";

type TJobCriteriaProps = {
  job: Partial<TJob>;
};

const JobCriteria: FC<TJobCriteriaProps> = ({ job }) => {
  if (!job?.criterias?.length) return <div></div>;
  return (
    <Accordion defaultExpandedKeys={[(job?.criterias as ICriteria[])[0]._id]}>
      {(job?.criterias as ICriteria[])?.map((criteria) => (
        <AccordionItem
          key={criteria._id}
          aria-label={criteria?.name}
          title={criteria?.name}
        >
          <CriteriaDetail key={criteria._id} criteria={criteria} />
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default JobCriteria;
