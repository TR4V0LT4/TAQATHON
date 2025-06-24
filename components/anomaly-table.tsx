"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "./status-badge"
import type { Anomaly } from "@/lib/types"
import { ArrowUpDown, Edit3, Eye, Trash2, FilterX } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AnomalyTableProps {
  initialAnomalies: Anomaly[]
  onDataChange: () => void // Callback to refresh data from server
}

type SortKey = keyof Anomaly | ""
type SortOrder = "asc" | "desc"

export function AnomalyTable({ initialAnomalies, onDataChange }: AnomalyTableProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(initialAnomalies)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<Anomaly["status"] | "all">("all")
  const [filterCriticality, setFilterCriticality] = useState<Anomaly["criticality"] | "all">("all")
  const [sortKey, setSortKey] = useState<SortKey>("detectionDate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const { toast } = useToast()

  useEffect(() => {
    setAnomalies(initialAnomalies)
  }, [initialAnomalies])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  const filteredAndSortedAnomalies = useMemo(() => {
    let result = [...anomalies]

    // Filtering
    if (searchTerm) {
      result = result.filter(
        (anomaly) =>
          anomaly.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          anomaly.equipment.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (filterStatus !== "all") {
      result = result.filter((anomaly) => anomaly.status === filterStatus)
    }
    if (filterCriticality !== "all") {
      result = result.filter((anomaly) => anomaly.criticality === filterCriticality)
    }

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey]
        const valB = b[sortKey]

        if (valA === undefined || valB === undefined) return 0

        let comparison = 0
        if (typeof valA === "string" && typeof valB === "string") {
          comparison = valA.localeCompare(valB)
        } else if (typeof valA === "number" && typeof valB === "number") {
          comparison = valA - valB
        } else if (valA instanceof Date && valB instanceof Date) {
          comparison = valA.getTime() - valB.getTime()
        } else {
          // Fallback for mixed types or other types, convert to string
          comparison = String(valA).localeCompare(String(valB))
        }
        return sortOrder === "asc" ? comparison : -comparison
      })
    }
    return result
  }, [anomalies, searchTerm, filterStatus, filterCriticality, sortKey, sortOrder])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/anomalies/${id}`, { method: "DELETE" })
      if (!response.ok) {
        const errorResult = await response.json()
        throw new Error(errorResult.error || "Failed to delete anomaly")
      }
      toast({ title: "Anomaly Deleted", description: "The anomaly has been successfully deleted." })
      onDataChange() // Refresh data from server
    } catch (error) {
      toast({
        title: "Error Deleting Anomaly",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterCriticality("all")
    setSortKey("detectionDate")
    setSortOrder("desc")
  }

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    return sortOrder === "asc" ? (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center p-4 border rounded-lg bg-card">
        <Input
          placeholder="Search by title or equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as Anomaly["status"] | "all")}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterCriticality}
          onValueChange={(value) => setFilterCriticality(value as Anomaly["criticality"] | "all")}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by criticality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Criticalities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={clearFilters} className="w-full md:w-auto">
          <FilterX className="mr-2 h-4 w-4" /> Clear Filters
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("title")} className="cursor-pointer">
                Title {renderSortIcon("title")}
              </TableHead>
              <TableHead onClick={() => handleSort("equipment")} className="cursor-pointer">
                Equipment {renderSortIcon("equipment")}
              </TableHead>
              <TableHead onClick={() => handleSort("detectionDate")} className="cursor-pointer">
                Detection Date {renderSortIcon("detectionDate")}
              </TableHead>
              <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                Status {renderSortIcon("status")}
              </TableHead>
              <TableHead onClick={() => handleSort("criticality")} className="cursor-pointer">
                Criticality {renderSortIcon("criticality")}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedAnomalies.length > 0 ? (
              filteredAndSortedAnomalies.map((anomaly) => (
                <TableRow key={anomaly._id}>
                  <TableCell className="font-medium">{anomaly.title}</TableCell>
                  <TableCell>{anomaly.equipment}</TableCell>
                  <TableCell>{format(parseISO(anomaly.detectionDate), "PPp")}</TableCell>
                  <TableCell>
                    <StatusBadge status={anomaly.status} />
                  </TableCell>
                  <TableCell>{anomaly.criticality}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/anomalies/${anomaly._id}`} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/anomalies/${anomaly._id}/edit`} title="Edit Anomaly">
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Anomaly"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the anomaly titled "
                            {anomaly.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(anomaly._id!)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No anomalies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Basic Pagination Info (can be expanded with a proper pagination component) */}
      <div className="flex items-center justify-end space-x-2 py-4 text-sm text-muted-foreground">
        Total anomalies: {filteredAndSortedAnomalies.length}
      </div>
    </div>
  )
}

AnomalyTable.defaultProps = {
  initialAnomalies: [],
  onDataChange: () => {},
}
