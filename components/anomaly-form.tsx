"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import type { Anomaly, AnomalyInput } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

const anomalySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  equipment: z.string().min(1, "Equipment is required"),
  detectionDate: z.date({ required_error: "Detection date is required." }),
  source: z.enum(["Oracle", "Maximo", "Excel", "Manual"]),
  responsiblePerson: z.string().min(1, "Responsible person is required"),
  status: z.enum(["New", "In Progress", "Resolved"]),
  criticality: z.enum(["High", "Medium", "Low"]),
  maintenanceWindow: z.date().optional().nullable(),
})

type AnomalyFormValues = z.infer<typeof anomalySchema>

interface AnomalyFormProps {
  anomaly?: Anomaly // For editing
  onSubmitSuccess?: () => void
}

export function AnomalyForm({ anomaly, onSubmitSuccess }: AnomalyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnomalyFormValues>({
    resolver: zodResolver(anomalySchema),
    defaultValues: anomaly
      ? {
          ...anomaly,
          detectionDate: anomaly.detectionDate ? parseISO(anomaly.detectionDate) : new Date(),
          maintenanceWindow: anomaly.maintenanceWindow ? parseISO(anomaly.maintenanceWindow) : null,
        }
      : {
          title: "",
          description: "",
          equipment: "",
          detectionDate: new Date(),
          source: "Manual",
          responsiblePerson: "",
          status: "New",
          criticality: "Medium",
          maintenanceWindow: null,
        },
  })

  useEffect(() => {
    if (anomaly) {
      reset({
        ...anomaly,
        detectionDate: anomaly.detectionDate ? parseISO(anomaly.detectionDate) : new Date(),
        maintenanceWindow: anomaly.maintenanceWindow ? parseISO(anomaly.maintenanceWindow) : null,
      })
    }
  }, [anomaly, reset])

  const onSubmit: SubmitHandler<AnomalyFormValues> = async (data) => {
    setIsSubmitting(true)
    try {
      const anomalyData: AnomalyInput = {
        ...data,
        detectionDate: data.detectionDate.toISOString(),
        maintenanceWindow: data.maintenanceWindow ? data.maintenanceWindow.toISOString() : undefined,
      }

      const response = await fetch(anomaly ? `/api/anomalies/${anomaly._id}` : "/api/anomalies", {
        method: anomaly ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anomalyData),
      })

      if (!response.ok) {
        const errorResult = await response.json()
        throw new Error(errorResult.error || `Failed to ${anomaly ? "update" : "create"} anomaly`)
      }

      toast({
        title: `Anomaly ${anomaly ? "Updated" : "Created"}`,
        description: `Anomaly "${data.title}" has been successfully ${anomaly ? "updated" : "created"}.`,
      })

      if (onSubmitSuccess) {
        onSubmitSuccess()
      } else {
        router.push("/dashboard") // Default redirect
        router.refresh() // Ensure data is fresh
      }
    } catch (error) {
      console.error(error)
      toast({
        title: `Error ${anomaly ? "Updating" : "Creating"} Anomaly`,
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const DateInput = ({
    value,
    onChange,
    error,
  }: { value?: Date | null; onChange: (date?: Date) => void; error?: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={value || undefined} onSelect={onChange} initialFocus />
      </PopoverContent>
      {error && <p className="text-sm font-medium text-destructive mt-1">{error}</p>}
    </Popover>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{anomaly ? "Edit Anomaly" : "Add New Anomaly"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} className={errors.title ? "border-destructive" : ""} />
            {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipment">Equipment</Label>
              <Input
                id="equipment"
                {...register("equipment")}
                className={errors.equipment ? "border-destructive" : ""}
              />
              {errors.equipment && <p className="text-sm font-medium text-destructive">{errors.equipment.message}</p>}
            </div>
            <div>
              <Label htmlFor="detectionDate">Detection Date</Label>
              <Controller
                name="detectionDate"
                control={control}
                render={({ field }) => (
                  <DateInput value={field.value} onChange={field.onChange} error={errors.detectionDate?.message} />
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source">Source</Label>
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="source" className={errors.source ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Excel">Excel</SelectItem>
                      <SelectItem value="Oracle">Oracle</SelectItem>
                      <SelectItem value="Maximo">Maximo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.source && <p className="text-sm font-medium text-destructive">{errors.source.message}</p>}
            </div>
            <div>
              <Label htmlFor="responsiblePerson">Responsible Person</Label>
              <Input
                id="responsiblePerson"
                {...register("responsiblePerson")}
                className={errors.responsiblePerson ? "border-destructive" : ""}
              />
              {errors.responsiblePerson && (
                <p className="text-sm font-medium text-destructive">{errors.responsiblePerson.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="status" className={errors.status ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm font-medium text-destructive">{errors.status.message}</p>}
            </div>
            <div>
              <Label htmlFor="criticality">Criticality</Label>
              <Controller
                name="criticality"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="criticality" className={errors.criticality ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select criticality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.criticality && (
                <p className="text-sm font-medium text-destructive">{errors.criticality.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="maintenanceWindow">Maintenance Window (Optional)</Label>
            <Controller
              name="maintenanceWindow"
              control={control}
              render={({ field }) => (
                <DateInput value={field.value} onChange={field.onChange} error={errors.maintenanceWindow?.message} />
              )}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {anomaly ? "Update Anomaly" : "Create Anomaly"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

AnomalyForm.defaultProps = {
  anomaly: undefined,
  onSubmitSuccess: undefined,
}
