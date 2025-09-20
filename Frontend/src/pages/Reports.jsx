import React from "react";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import WorkOrdersAnalysis from "../components/reports/WorkOrdersAnalysis";
import {
  User,
} from "lucide-react";

export default function Reports() {

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
        

          {/* Work Orders Analysis Section */}
          <WorkOrdersAnalysis />
        </div>
      </div>
    </div>
  );
}