"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AnomalyForm } from "@/components/anomaly-form"
import type { Anomaly } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react"

export default function EditAnomalyPage() {
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
            if (response.status === 404) throw new Error("Anomaly not found to edit")
            throw new Error("Failed to fetch anomaly for editing")
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
    return <div className="container mx-auto py-6 text-center">Anomaly data could not be loaded.</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link href={`/anomalies/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Details</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Edit Anomaly: {anomaly.title}</h1>
      </div>
      <AnomalyForm anomaly={anomaly} onSubmitSuccess={() => router.push(`/anomalies/${id}`)} />
    </div>
  )
}
