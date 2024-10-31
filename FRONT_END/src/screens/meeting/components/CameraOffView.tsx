import { Avatar } from "@nextui-org/react";

type CameraOffViewProps = {
  name?: string;
  avatartStyle?: string;
};

const CameraOffView: React.FC<CameraOffViewProps> = ({
  name,
  avatartStyle,
}): React.JSX.Element => {
  const shortedNameFormat = (name: string | undefined): string => {
    if (name)
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    return "User";
  };
  return (
    <div className="h-full w-full relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Avatar
          isBordered
          className={`w-36 h-36 text-2xl text-themeWhite ${avatartStyle}`}
          name={shortedNameFormat(name)}
        />
      </div>
    </div>
  );
};

export default CameraOffView;
