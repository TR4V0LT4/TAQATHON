import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { Anomaly as AnomalyType } from "@/lib/types"

// Extend AnomalyType to include Mongoose Document properties
export interface AnomalyDocument extends AnomalyType, Document {}

const AnomalySchema: Schema<AnomalyDocument> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    equipment: { type: String, required: true },
    detectionDate: { type: Date, required: true },
    source: { type: String, enum: ["Oracle", "Maximo", "Excel", "Manual"], default: "Manual", required: true },
    responsiblePerson: { type: String, required: true },
    status: { type: String, enum: ["New", "In Progress", "Resolved"], default: "New", required: true },
    criticality: { type: String, enum: ["High", "Medium", "Low"], default: "Medium", required: true },
    maintenanceWindow: { type: Date, required: false },
    attachments: [{ name: String, url: String }],
  },
  { timestamps: true }, // Adds createdAt and updatedAt
)

// Prevent model recompilation in Next.js hot-reloading environments
const AnomalyModel: Model<AnomalyDocument> =
  mongoose.models.Anomaly || mongoose.model<AnomalyDocument>("Anomaly", AnomalySchema)

export default AnomalyModel
