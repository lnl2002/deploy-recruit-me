type JobSectionProps = {
  title: string;
  content: string;
};

const JobSection: React.FC<JobSectionProps> = ({
  title,
  content,
}): React.JSX.Element => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-themeDark text-2xl font-bold">{title}</p>
      <p className="text-blurEffect text-sm">{content}</p>
    </div>
  );
};

export default JobSection;
