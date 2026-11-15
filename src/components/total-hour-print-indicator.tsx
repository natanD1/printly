import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDuration } from "@/utils/format-duration";

export function TotalHourPrintIndicator({
  description,
  hours,
}: {
  description: string;
  hours: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-4 text-sky-500 dark:text-sky-400" />
          Horas de impressão
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="font-heading font-semibold text-3xl text-sky-500 dark:text-sky-400">
          {formatDuration(hours)}
        </p>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
