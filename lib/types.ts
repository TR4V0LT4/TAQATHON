export interface Anomaly {
  _id?: string // MongoDB ObjectId
  title: string
  description: string
  equipment: string
  detectionDate: string // Store as ISO string, handle Date object conversion
  source: "Oracle" | "Maximo" | "Excel" | string // Allow other strings
  responsiblePerson: string
  status: "New" | "In Progress" | "Resolved"
  criticality: "High" | "Medium" | "Low"
  maintenanceWindow?: string // Store as ISO string
  attachments?: { name: string; url: string }[] // Optional
  createdAt?: string
  updatedAt?: string
}

export type AnomalyInput = Omit<Anomaly, "_id" | "createdAt" | "updatedAt">
