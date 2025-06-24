"use client" // For useEffect, useState

import { useState, useEffect, useCallback } from "react"
import { FileUpload } from "@/components/file-upload"
import { AnomalyTable } from "@/components/anomaly-table"
import type { Anomaly } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, RefreshCw, Loader2, FileText, Wrench, Archive } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnomalies = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/anomalies")
      if (!response.ok) {
        throw new Error("Failed to fetch anomalies")
      }
      const data = await response.json()
      setAnomalies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setAnomalies([]) // Clear anomalies on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnomalies()
  }, [fetchAnomalies])

  const handleUploadSuccess = () => {
    fetchAnomalies() // Refresh data after upload
  }

  // KPI Data (Example - can be expanded)
  const kpiData = {
    openAnomalies: anomalies.filter((a) => a.status !== "Resolved").length,
    highCriticality: anomalies.filter((a) => a.criticality === "High" && a.status !== "Resolved").length,
    totalAnomalies: anomalies.length,
  }

  return (
    <div className="container mx-auto py-2 md:py-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Anomaly Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={fetchAnomalies} variant="outline" disabled={isLoading}>
            {isLoading && !anomalies.length ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Data
          </Button>
          <Button asChild>
            <Link href="/anomalies/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Anomaly
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Anomalies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : kpiData.openAnomalies}
            </div>
            <p className="text-xs text-muted-foreground">Currently active issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Criticality (Open)</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : kpiData.highCriticality}
            </div>
            <p className="text-xs text-muted-foreground">Urgent open issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : kpiData.totalAnomalies}
            </div>
            <p className="text-xs text-muted-foreground">All recorded anomalies</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      {error && <p className="text-red-500 text-center my-4">Error: {error}</p>}

      {isLoading && anomalies.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <AnomalyTable initialAnomalies={anomalies} onDataChange={fetchAnomalies} />
      )}
    </div>
  )
}
