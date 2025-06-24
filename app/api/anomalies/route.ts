import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import AnomalyModel from "@/models/Anomaly"
import type { AnomalyInput } from "@/lib/types"

export async function GET(request: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    // Basic filtering example (can be expanded)
    const filters: any = {}
    if (searchParams.get("status")) filters.status = searchParams.get("status")
    if (searchParams.get("criticality")) filters.criticality = searchParams.get("criticality")
    if (searchParams.get("equipment")) filters.equipment = { $regex: searchParams.get("equipment"), $options: "i" }

    // Basic sorting (can be expanded)
    const sort: any = {}
    if (searchParams.get("sortBy")) {
      const sortBy = searchParams.get("sortBy")!
      const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1
      sort[sortBy] = sortOrder
    } else {
      sort.createdAt = -1 // Default sort
    }

    const anomalies = await AnomalyModel.find(filters).sort(sort).lean()
    return NextResponse.json(
      anomalies.map((anomaly) => ({
        ...anomaly,
        _id: anomaly._id.toString(),
        detectionDate: anomaly.detectionDate.toISOString(),
        maintenanceWindow: anomaly.maintenanceWindow?.toISOString(),
        createdAt: anomaly.createdAt?.toISOString(),
        updatedAt: anomaly.updatedAt?.toISOString(),
      })),
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error fetching anomalies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const body = (await request.json()) as AnomalyInput

    const newAnomalyData = {
      ...body,
      detectionDate: new Date(body.detectionDate),
      maintenanceWindow: body.maintenanceWindow ? new Date(body.maintenanceWindow) : undefined,
    }

    const newAnomaly = new AnomalyModel(newAnomalyData)
    await newAnomaly.save()

    const savedAnomaly = newAnomaly.toObject()
    return NextResponse.json(
      {
        ...savedAnomaly,
        _id: savedAnomaly._id.toString(),
        detectionDate: savedAnomaly.detectionDate.toISOString(),
        maintenanceWindow: savedAnomaly.maintenanceWindow?.toISOString(),
        createdAt: savedAnomaly.createdAt?.toISOString(),
        updatedAt: savedAnomaly.updatedAt?.toISOString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error(error)
    // Handle Mongoose validation errors specifically if needed
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Error creating anomaly" }, { status: 500 })
  }
}
