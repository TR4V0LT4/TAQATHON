import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench } from "lucide-react"

export default function MaintenanceWindowsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Maintenance Windows</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="mr-2 h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This section will allow linking anomalies to planned maintenance windows. Functionality to manage
            maintenance schedules will be added here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
