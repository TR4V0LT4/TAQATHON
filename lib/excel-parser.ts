import * as XLSX from "xlsx"
import type { AnomalyInput } from "./types"

// Expected headers in the Excel file
const EXPECTED_HEADERS = [
  "Title",
  "Description",
  "Equipment",
  "Date",
  "Source",
  "Responsible",
  "Status",
  "Criticality",
  "Maintenance Window",
]

export function parseExcelData(fileBuffer: ArrayBuffer): AnomalyInput[] {
  const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  // Convert sheet to JSON, ensuring headers are correctly mapped
  // Use raw: false to get formatted dates if cellDates: true is used
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false })

  if (!jsonData || jsonData.length < 2) {
    // At least one header row and one data row
    throw new Error("Excel file is empty or has no data rows.")
  }

  const headers = jsonData[0] as string[]
  const headerMap: Record<string, number> = {}
  headers.forEach((h, i) => (headerMap[h.trim()] = i))

  // Validate headers
  const missingHeaders = EXPECTED_HEADERS.filter((h) => !(h in headerMap))
  if (missingHeaders.length > 0) {
    throw new Error(`Missing expected headers: ${missingHeaders.join(", ")}`)
  }

  const anomalies: AnomalyInput[] = []
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as any[]
    if (!row || row.every((cell) => cell === null || cell === undefined || cell === "")) continue // Skip empty rows

    const detectionDateRaw = row[headerMap["Date"]]
    const maintenanceWindowRaw = row[headerMap["Maintenance Window"]]

    const anomaly: AnomalyInput = {
      title: row[headerMap["Title"]]?.toString() || `Untitled Anomaly ${i}`,
      description: row[headerMap["Description"]]?.toString() || "No description",
      equipment: row[headerMap["Equipment"]]?.toString() || "Unknown Equipment",
      detectionDate: detectionDateRaw instanceof Date ? detectionDateRaw.toISOString() : new Date().toISOString(),
      source: (row[headerMap["Source"]]?.toString() as AnomalyInput["source"]) || "Excel",
      responsiblePerson: row[headerMap["Responsible"]]?.toString() || "Unassigned",
      status: (row[headerMap["Status"]]?.toString() as AnomalyInput["status"]) || "New",
      criticality: (row[headerMap["Criticality"]]?.toString() as AnomalyInput["criticality"]) || "Medium",
      maintenanceWindow: maintenanceWindowRaw instanceof Date ? maintenanceWindowRaw.toISOString() : undefined,
    }
    anomalies.push(anomaly)
  }
  return anomalies
}
