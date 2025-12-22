"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

type ChartDataPoint = {
  date: string;
  visits: number;
};

type DefaultBarChartProps = {
  data: ChartDataPoint[];
  title?: string;
  description?: string;
};

const chartConfig = {
  visits: {
    label: "Visits",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Format date from "YYYY-MM-DD" to "MMM DD", day number, or weekday
function formatDate(dateString: string, format: "short" | "day" | "weekday" = "short"): string {
  const date = new Date(dateString);
  if (format === "day") {
    return date.getDate().toString();
  }
  if (format === "weekday") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

// Calculate percentage change
function calculateChange(data: ChartDataPoint[]): { value: number; isPositive: boolean } {
  if (data.length < 2) {
    return { value: 0, isPositive: true };
  }

  // Compare today to average of previous days
  const previousDays = data.slice(0, -1);
  const avg = previousDays.reduce((sum, d) => sum + d.visits, 0) / (previousDays.length || 1);
  const todayVal = data[data.length - 1].visits;

  if (avg === 0) return { value: todayVal > 0 ? 100 : 0, isPositive: true };

  const change = ((todayVal - avg) / avg) * 100;

  return {
    value: Math.abs(change),
    isPositive: change >= 0,
  };
}

// Generate dummy data: Last 7 days, empty except today
function generateDummyData(): ChartDataPoint[] {
  const dummyData: ChartDataPoint[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().slice(0, 10);

    // "Full for today" (i=0), "empty" (0) for others
    const visits = i === 0 ? 1240 : 0;

    dummyData.push({ date: dateString, visits });
  }

  return dummyData;
}

export function DefaultBarChart({
  data,
  title = "Visits over time",
  description
}: DefaultBarChartProps) {
  const displayData = data && data.length > 0 ? data : generateDummyData();

  const chartData = displayData.map((item) => ({
    date: formatDate(item.date, "short"),
    day: formatDate(item.date, "weekday"),
    visits: item.visits,
    isToday: new Date(item.date).toDateString() === new Date().toDateString(),
  }));

  const dateRange = displayData.length > 0
    ? `${formatDate(displayData[0].date)} - ${formatDate(displayData[displayData.length - 1].date)}`
    : "";

  const change = calculateChange(displayData);

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="px-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {title}
              {change.value > 0 && (
                <Badge
                  variant="outline"
                  className={`${change.isPositive
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : "text-rose-500 bg-rose-500/10 border-rose-500/20"
                    } border-none text-[10px] px-1.5 h-5`}
                >
                  {change.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{change.value.toFixed(0)}%</span>
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-zinc-500">
              {description || dateRange}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              style={{ fill: "hsl(var(--muted-foreground))", fontSize: "12px" }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.05)", radius: 4 }}
              content={<ChartTooltipContent hideLabel />}
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.date;
                }
                return value;
              }}
            />
            <Bar
              dataKey="visits"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="default-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="dark:text-muted/40 text-muted"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};
