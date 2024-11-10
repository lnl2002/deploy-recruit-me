type JobSectionProps = {
  title: string;
  content: string;
  isHtml?: boolean;
};

const JobSection: React.FC<JobSectionProps> = ({
  title,
  content,
  isHtml = false,
}): React.JSX.Element => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-themeDark text-2xl font-bold">{title}</p>
      {isHtml ? (
        <div
          className="text-blurEffect text-sm"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p className="text-blurEffect text-sm">{content}</p>
      )}
    </div>
  );
};

export default JobSection;
