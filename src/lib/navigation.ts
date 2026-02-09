import {
  Eye,
  Zap,
  Users,
  Clock,
  GitCompare,
  type LucideIcon,
  BarChart,
  Settings,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isNew?: boolean;
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

// Dashboard navigation sections (like Umami)
export const dashboardNavigation: NavigationSection[] = [
  {
    title: "",
    items: [
      { title: "Projects", href: "/dashboard/analytics", icon: Eye },
      { title: "Settings", href: "/dashboard/settings/", icon: Settings },
    ],
  }
];

// Icon rail items (left side)
export type IconRailItem = {
  icon: LucideIcon;
  href: string;
  tooltip: string;
  position?: "top" | "bottom";
};
