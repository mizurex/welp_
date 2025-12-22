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
    title: "Traffic",
    items: [
      { title: "All projects", href: "/dashboard/analytics", icon: Eye },
      { title: "Analytics", href: "/dashboard/analytics", icon: Zap },
      { title: "Sessions", href: "/dashboard/analytics/sessions", icon: Users },
      { title: "Events", href: "/dashboard/analytics/events", icon: Clock },
      { title: "Compare", href: "/dashboard/analytics/compare", icon: GitCompare },
      { title: "Breakdown", href: "/dashboard/analytics/breakdown", icon: LayoutGrid },
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
