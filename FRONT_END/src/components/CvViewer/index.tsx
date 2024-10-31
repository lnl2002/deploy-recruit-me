import { LottieApp } from "@/lotties";
import { Button } from "@nextui-org/react";
import {
  Download,
  SquareArrowOutUpRight,
} from "lucide-react";
import Lottie from "react-lottie";

export const CvViewer = ({ url }: { url: string }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "document.pdf");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(url, "_blank"); // Open in a new tab/window
  };

  return (
    <div className="w-full" style={{ height: 800 }}>
      <div className="flex gap-3">
        <Button
          onClick={handleDownload}
          className="bg-blurEffectGold"
          disabled={!url}
        >
          <Download />
          Download
        </Button>
        <Button variant="light" onClick={handleOpenInNewTab} disabled={!url}>
          <SquareArrowOutUpRight />
          {/* Assuming you have a suitable icon component */}
        </Button>
      </div>

      <div className="h-full py-5 flex justify-center items-center">
        {url && url != "" ? (
          <iframe
            className="w-full h-full"
            src={url}
            title="Document Preview"
          />
        ) : (
          <div>
            <Lottie
              style={{ width: 100, height: 100 }}
              options={{
                loop: true,
                autoplay: true,
                animationData: LottieApp.Loading,
                rendererSettings: {
                  preserveAspectRatio: "xMidYMid slice",
                },
              }}
              isClickToPauseDisabled={true}
              width={"100%"}
            />
            <p className="text-primary-500">Loading CV, please wait...</p>
          </div>
        )}
      </div>
    </div>
  );
};
