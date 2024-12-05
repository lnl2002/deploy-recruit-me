import React from "react";
import {
  Modal,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
} from "@nextui-org/react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";

// Đăng ký các thành phần bắt buộc
ChartJS.register(RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

export type Criterion = {
  criterionId: string;
  criterion: string;
  score: string;
  explanation: string;
};

type AIScoreModalProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  criteria: Criterion[];
  onViewCv: () => void;
  name: string;
};

const AIScoreModal: React.FC<AIScoreModalProps> = ({
  isOpen,
  onOpenChange,
  criteria,
  onViewCv,
  name,
}) => {
  // Chuẩn bị dữ liệu cho biểu đồ radar
  const labels = criteria.map((c) => c.criterion);
  const scores = criteria.map((c) => parseInt(c.score.split("/")[0], 10));
  const maxScores = criteria.map((c) => parseInt(c.score.split("/")[1], 10));

  const data: ChartData<"radar"> = {
    labels,
    datasets: [
      {
        label: "AI Score",
        data: scores,
        backgroundColor: "rgba(241, 110, 33, 0.2)",
        borderColor: "rgba(241, 110, 33, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(241, 110, 33, 1)", // Màu nền của điểm
        pointBorderColor: "#fff", // Màu viền của điểm
        pointHoverBackgroundColor: "#fff", // Màu nền của điểm khi hover
        pointHoverBorderColor: "rgba(241, 110, 33, 1)", // Màu viền của điểm khi hover
        pointRadius: 5, // Bán kính của mỗi điểm
        pointHoverRadius: 7, // Bán kính khi hover vào điểm
      },
      {
        label: "Max Score",
        data: maxScores,
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(37, 99, 235, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(37, 99, 235, 1)",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        pointLabels: {
          font: {
            size: 12, // Kích thước font cho nhãn xung quanh radar chart
          },
        },
      },
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="min-w-[80vw] text-themeDark"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              AI Evaluation Details
            </ModalHeader>
            <ModalBody className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <div>
                  <Button 
                    className="bg-themeOrange text-[#fff]" 
                    radius="full"
                    onClick={onViewCv}
                    >
                    View {name || ''} CV
                  </Button>
                </div>

                <div className="flex items-center justify-center max-h-[90%]">
                  {/* Hiển thị biểu đồ Radar */}
                  <Radar data={data} options={options} />
                </div>
              </div>
              <div className="space-y-4 max-h-[80vh] overflow-y-scroll pb-4">
                {criteria.map((criterion) => (
                  <div
                    key={criterion.criterionId}
                    className="p-4 border border-gray-300 rounded-lg"
                  >
                    <div className="mb-2">{criterion.criterion}</div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold mr-2">Reason:</span>
                      {criterion.explanation}
                    </p>
                    <p className="text-sm font-semibold">
                      Score: {criterion.score}
                    </p>
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
                onPress={onClose}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AIScoreModal;
