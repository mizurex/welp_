import {
  Eye,
  Zap,
  Users,
  Clock,
  GitCompare,
  LayoutGrid,
  Target,
  Filter,
  Route,
  RefreshCcw,
  PieChart,
  UsersRound,
  type LucideIcon,
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
      { title: "Overview", href: "/dashboard/analytics", icon: Eye },
      { title: "Traffic", href: "/dashboard/analytics", icon: Zap },
      { title: "Sessions", href: "/dashboard/analytics/sessions", icon: Users },
      { title: "Events", href: "/dashboard/analytics/events", icon: Clock },
      { title: "Settings", href: "/dashboard/analytics/breakdown", icon: LayoutGrid },
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
