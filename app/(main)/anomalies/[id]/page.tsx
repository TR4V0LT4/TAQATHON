"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Anomaly } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { ArrowLeft, Edit3, CalendarIcon, User, AlertTriangle, Layers, FileText, Tag, Loader2 } from "lucide-react"
import { format, parseISO } from "date-fns"

export default function AnomalyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      const fetchAnomaly = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const response = await fetch(`/api/anomalies/${id}`)
          if (!response.ok) {
            if (response.status === 404) throw new Error("Anomaly not found")
            throw new Error("Failed to fetch anomaly details")
          }
          const data = await response.json()
          setAnomaly(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred")
        } finally {
          setIsLoading(false)
        }
      }
      fetchAnomaly()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive mb-4">Error: {error}</p>
        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
      </div>
    )
  }

  if (!anomaly) {
    return <div className="container mx-auto py-6 text-center">Anomaly not found.</div>
  }

  const detailItem = (icon: React.ReactNode, label: string, value?: string | React.ReactNode) => (
    <div className="flex items-start space-x-3 py-2">
      <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base">{value || "N/A"}</p>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold truncate" title={anomaly.title}>
          Anomaly Details
        </h1>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{anomaly.title}</CardTitle>
              <CardDescription>Equipment: {anomaly.equipment}</CardDescription>
            </div>
            <StatusBadge status={anomaly.status} />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {detailItem(<FileText className="h-5 w-5" />, "Description", anomaly.description)}
          {detailItem(<AlertTriangle className="h-5 w-5" />, "Criticality", anomaly.criticality)}
          {detailItem(
            <CalendarIcon className="h-5 w-5" />,
            "Detection Date",
            format(parseISO(anomaly.detectionDate), "PPPp"),
          )}
          {detailItem(<Layers className="h-5 w-5" />, "Source", anomaly.source)}
          {detailItem(<User className="h-5 w-5" />, "Responsible Person", anomaly.responsiblePerson)}
          {detailItem(
            <CalendarIcon className="h-5 w-5" />,
            "Maintenance Window",
            anomaly.maintenanceWindow ? format(parseISO(anomaly.maintenanceWindow), "PPP") : "Not set",
          )}
          {detailItem(<Tag className="h-5 w-5" />, "Anomaly ID", anomaly._id)}
          {anomaly.createdAt &&
            detailItem(<CalendarIcon className="h-5 w-5" />, "Created At", format(parseISO(anomaly.createdAt), "PPPp"))}
          {anomaly.updatedAt &&
            detailItem(
              <CalendarIcon className="h-5 w-5" />,
              "Last Updated",
              format(parseISO(anomaly.updatedAt), "PPPp"),
            )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href={`/anomalies/${anomaly._id}/edit`}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Anomaly
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
