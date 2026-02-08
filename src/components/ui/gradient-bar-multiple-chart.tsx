"use client";

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

interface DataPoint {
  label: string;
  visitors: number;
  views: number;
}

interface GradientBarMultipleChartProps {
  data: DataPoint[];
  title?: string;
  description?: string;
}

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "#56361d",
  },
  views: {
    label: "Views",
    color: "#4b2f19ff",
  },
} satisfies ChartConfig;

export function GradientBarMultipleChart({
  data,
  title = "Traffic Analytics",
  description = "Total visitors and views"
}: GradientBarMultipleChartProps) {
  return (
    <Card className="h-full py-[7px] shadow-none font-sans rounded-[6px] bg-bg-primary flex flex-col text-foreground border border-stone-300">
      <CardHeader className="">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground/80 font-medium text-lg">{title}</CardTitle>
            <CardDescription className="text-stone-400 font-medium text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="border-stone-200 rounded-md">
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="visitors"
              shape={<CustomGradientBar />}
              fill="var(--color-visitors)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="views"
              shape={<CustomGradientBar />}
              fill="var(--color-views)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomGradientBar = (
  props: React.SVGProps<SVGRectElement> & { dataKey?: string }
) => {
  const { fill, x, y, width, height, dataKey } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="none"
        fill={`url(#gradient-multiple-bar-pattern-${dataKey})`}
      />
      <rect x={x} y={y} width={width} height={2} stroke="none" fill={fill} />
      <defs>
        <linearGradient
          id={`gradient-multiple-bar-pattern-${dataKey}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={fill} stopOpacity={0.8} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.1} />
        </linearGradient>
      </defs>
    </g>
  );
};

