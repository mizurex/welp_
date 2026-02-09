import { Loader } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex items-center justify-center h-16">
        <Loader className="w-5 h-5 animate-spin" />
      </div>
    </div>
  );
}
