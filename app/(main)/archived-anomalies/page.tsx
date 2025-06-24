import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Archive } from "lucide-react"

export default function ArchivedAnomaliesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Archived Anomalies</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="mr-2 h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This section will display anomalies that have been archived. Functionality to archive and manage archived
            anomalies will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
