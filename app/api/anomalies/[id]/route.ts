import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import AnomalyModel from "@/models/Anomaly"
import type { AnomalyInput } from "@/lib/types"

interface Params {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    await dbConnect()
    const anomaly = await AnomalyModel.findById(params.id).lean()
    if (!anomaly) {
      return NextResponse.json({ error: "Anomaly not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...anomaly,
      _id: anomaly._id.toString(),
      detectionDate: anomaly.detectionDate.toISOString(),
      maintenanceWindow: anomaly.maintenanceWindow?.toISOString(),
      createdAt: anomaly.createdAt?.toISOString(),
      updatedAt: anomaly.updatedAt?.toISOString(),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error fetching anomaly" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await dbConnect()
    const body = (await request.json()) as Partial<AnomalyInput>

    const updateData: any = { ...body }
    if (body.detectionDate) updateData.detectionDate = new Date(body.detectionDate)
    if (body.maintenanceWindow) updateData.maintenanceWindow = new Date(body.maintenanceWindow)
    else if (body.hasOwnProperty("maintenanceWindow") && !body.maintenanceWindow)
      updateData.maintenanceWindow = undefined

    const updatedAnomaly = await AnomalyModel.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updatedAnomaly) {
      return NextResponse.json({ error: "Anomaly not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...updatedAnomaly,
      _id: updatedAnomaly._id.toString(),
      detectionDate: updatedAnomaly.detectionDate.toISOString(),
      maintenanceWindow: updatedAnomaly.maintenanceWindow?.toISOString(),
      createdAt: updatedAnomaly.createdAt?.toISOString(),
      updatedAt: updatedAnomaly.updatedAt?.toISOString(),
    })
  } catch (error) {
    console.error(error)
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Error updating anomaly" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await dbConnect()
    const deletedAnomaly = await AnomalyModel.findByIdAndDelete(params.id)
    if (!deletedAnomaly) {
      return NextResponse.json({ error: "Anomaly not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Anomaly deleted successfully" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error deleting anomaly" }, { status: 500 })
  }
}
