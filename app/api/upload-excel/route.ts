import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import AnomalyModel from "@/models/Anomaly"
import { parseExcelData } from "@/lib/excel-parser"
import type { AnomalyInput } from "@/lib/types"

export async function POST(request: Request) {
  try {
    await dbConnect()
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const fileBuffer = await file.arrayBuffer()
    const anomaliesData = parseExcelData(fileBuffer)

    if (anomaliesData.length === 0) {
      return NextResponse.json({ message: "No anomalies found in the file or file was empty." }, { status: 200 })
    }

    // Upsert logic: Update if exists (e.g., based on title and equipment), else insert.
    // For simplicity, this example will insert all as new.
    // A more robust solution would check for duplicates.
    const operations = anomaliesData.map((anomalyInput: AnomalyInput) => ({
      insertOne: {
        document: {
          ...anomalyInput,
          detectionDate: new Date(anomalyInput.detectionDate), // Convert to Date object
          maintenanceWindow: anomalyInput.maintenanceWindow ? new Date(anomalyInput.maintenanceWindow) : undefined,
          source: anomalyInput.source || "Excel", // Ensure source is set
        },
      },
    }))

    const result = await AnomalyModel.bulkWrite(operations)

    return NextResponse.json(
      {
        message: "Excel data processed successfully.",
        insertedCount: result.insertedCount,
        // matchedCount: result.matchedCount, // if using upsert
        // modifiedCount: result.modifiedCount, // if using upsert
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error processing Excel file:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
  }
}
