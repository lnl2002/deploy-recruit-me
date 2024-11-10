import { Avatar } from "@nextui-org/react";
import { MicOff } from "lucide-react";

type CameraOffViewProps = {
  name?: string;
  avatartStyle?: string;
  isAudioSubscribe?: boolean;
};

const CameraOffView: React.FC<CameraOffViewProps> = ({
  name,
  avatartStyle,
  isAudioSubscribe,
}): React.JSX.Element => {
  const shortedNameFormat = (name: string | undefined): string => {
    if (name) {
      return name
        .split(/\s+/)
        .filter((word) => /^[A-Za-z]/.test(word))
        .map((word) => word[0].toUpperCase())
        .join("");
    }

    return "User";
  };
  return (
    <div className="h-full w-full relative">
      {!isAudioSubscribe && (
        <MicOff className="absolute right-3 top-3" size={16} color="#FFF" />
      )}
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
