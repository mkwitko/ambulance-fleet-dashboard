import { Progress } from "@/components/ui/progress";
import {
  GetAmbulancesControl200DataItemStatus,
  type GetAmbulancesControl200DataItem,
} from "@/http/generated/connectServer.schemas";

const AmbulanceStatusChart = ({
  ambulances,
}: {
  ambulances: GetAmbulancesControl200DataItem[] | undefined;
}) => {
  if (!ambulances) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-3">
          <div className="p-0">
            <div className="h-2 bg-gray-300 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="p-3">
          <div className="p-0">
            <div className="h-2 bg-gray-300 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const processAmbulances = () => {
    const activeAmbulances = ambulances.filter(
      (amb) => amb.status !== GetAmbulancesControl200DataItemStatus.FA
    );
    const occupiedAmbulances = activeAmbulances.filter(
      (amb) =>
        amb.status === GetAmbulancesControl200DataItemStatus.OCP ||
        amb.status === GetAmbulancesControl200DataItemStatus.EVT
    );
    const availableAmbulances = activeAmbulances.filter(
      (amb) =>
        amb.status !== GetAmbulancesControl200DataItemStatus.OCP &&
        amb.status !== GetAmbulancesControl200DataItemStatus.EVT
    );

    const totalActive = activeAmbulances.length;
    const occupiedCount = occupiedAmbulances.length;
    const availableCount = availableAmbulances.length;
    const occupiedPercentage =
      totalActive > 0 ? (occupiedCount / totalActive) * 100 : 0;

    return {
      total: totalActive,
      occupied: occupiedCount,
      available: availableCount,
      percentage: occupiedPercentage,
    };
  };

  const stats = processAmbulances();

  const getStatusColor = (percentage: number) => {
    if (percentage <= 50) return "bg-primary";
    if (percentage <= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = (percentage: number) => {
    if (percentage <= 50) return "text-primary";
    if (percentage <= 70) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="p-3 bg-connect">
        <div className="p-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Em Atendimento</span>
              <span
                className={`text-sm font-bold ${getTextColor(
                  stats.percentage
                )}`}
              >
                ({stats.occupied}/{stats.total})
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {stats.percentage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={stats.percentage}
            className={`${getStatusColor(stats.percentage)}`}
          />
        </div>
      </div>

      <div className="p-3 bg-connect">
        <div className="p-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Disponível</span>
              <span className="text-sm font-bold">
                ({stats.available}/{stats.total})
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {(100 - stats.percentage).toFixed(1)}%
            </span>
          </div>
          <Progress value={100 - stats.percentage} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default AmbulanceStatusChart;
