import * as XLSX from "xlsx";

/**
 * Generates an Excel file from work orders data
 * @param {Array} workOrders - Array of work orders data
 * @param {Object} filters - Current filter values
 * @param {string} filename - The name of the Excel file
 */
export const generateWorkOrdersExcel = (
  workOrders,
  filters,
  filename = "work-orders-analysis.xlsx"
) => {
  try {
    // Prepare data for Excel
    const excelData = workOrders.map((workOrder, index) => ({
      "S.No": index + 1,
      Operation: workOrder.operationName || "N/A",
      "Work Center": workOrder.workCenterName || "N/A",
      Product: workOrder.manufacturingOrder?.product?.name || "N/A",
      Quantity: workOrder.manufacturingOrder?.quantity || "N/A",
      "Expected Duration (HH:MM)": formatDuration(
        workOrder.estimatedTimeMinutes
      ),
      "Real Duration (HH:MM)": formatDuration(workOrder.realDuration),
      Status: workOrder.status?.replace("_", " ") || "N/A",
      "Efficiency %": calculateEfficiency(
        workOrder.estimatedTimeMinutes,
        workOrder.realDuration
      ),
    }));

    // Add summary row
    const totalExpectedDuration = workOrders.reduce(
      (sum, wo) => sum + (wo.estimatedTimeMinutes || 0),
      0
    );
    const totalRealDuration = workOrders.reduce(
      (sum, wo) => sum + (wo.realDuration || 0),
      0
    );
    const avgEfficiency =
      workOrders.length > 0
        ? workOrders.reduce(
            (sum, wo) =>
              sum +
              calculateEfficiency(wo.estimatedTimeMinutes, wo.realDuration),
            0
          ) / workOrders.length
        : 0;

    const summaryRow = {
      "S.No": "",
      Operation: "TOTAL",
      "Work Center": "",
      Product: "",
      Quantity: workOrders.length,
      "Expected Duration (HH:MM)": formatDuration(totalExpectedDuration),
      "Real Duration (HH:MM)": formatDuration(totalRealDuration),
      Status: "orders",
      "Efficiency %": `${avgEfficiency.toFixed(1)}%`,
    };

    // Add summary row to data
    excelData.push({}); // Empty row
    excelData.push(summaryRow);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 8 }, // S.No
      { wch: 25 }, // Operation
      { wch: 20 }, // Work Center
      { wch: 20 }, // Product
      { wch: 10 }, // Quantity
      { wch: 18 }, // Expected Duration
      { wch: 18 }, // Real Duration
      { wch: 15 }, // Status
      { wch: 12 }, // Efficiency %
    ];
    ws["!cols"] = colWidths;

    // Add filters applied information
    const filterInfo = [];
    if (filters.searchTerm) {
      filterInfo.push(`Search: ${filters.searchTerm}`);
    }
    if (filters.operationFilter !== "all") {
      filterInfo.push(`Operation: ${filters.operationFilter}`);
    }
    if (filters.workCenterFilter !== "all") {
      filterInfo.push(`Work Center: ${filters.workCenterFilter}`);
    }
    if (filters.statusFilter !== "all") {
      filterInfo.push(`Status: ${filters.statusFilter.replace("_", " ")}`);
    }

    // Add metadata sheet
    const metadata = [
      ["Work Orders Analysis Report"],
      ["Generated on:", new Date().toLocaleDateString()],
      ["Generated at:", new Date().toLocaleTimeString()],
      ["Total Records:", workOrders.length],
      [""],
      ["Filters Applied:"],
      ...filterInfo.map((info) => [info]),
      [""],
      ["Summary:"],
      ["Total Expected Duration:", formatDuration(totalExpectedDuration)],
      ["Total Real Duration:", formatDuration(totalRealDuration)],
      ["Average Efficiency:", `${avgEfficiency.toFixed(1)}%`],
    ];

    const metadataWs = XLSX.utils.aoa_to_sheet(metadata);
    metadataWs["!cols"] = [{ wch: 25 }, { wch: 30 }];

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Work Orders Data");
    XLSX.utils.book_append_sheet(wb, metadataWs, "Report Info");

    // Style the main data sheet
    const range = XLSX.utils.decode_range(ws["!ref"]);

    // Style header row
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) ws[cellAddress] = { v: "" };
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // Style data rows
    for (let row = 1; row <= workOrders.length; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: "" };

        // Alternating row colors
        const fillColor = row % 2 === 0 ? "F0F8FF" : "FFFFFF";
        ws[cellAddress].s = {
          fill: { fgColor: { rgb: fillColor } },
          alignment: { vertical: "center" },
        };
      }
    }

    // Style summary row
    const summaryRowIndex = workOrders.length + 1;
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({
        r: summaryRowIndex,
        c: col,
      });
      if (!ws[cellAddress]) ws[cellAddress] = { v: "" };
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1F497D" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // Save the file
    XLSX.writeFile(wb, filename);

    return { success: true, message: "Excel file generated successfully" };
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Helper function to format duration in HH:MM format
 */
const formatDuration = (minutes) => {
  if (!minutes) return "00:00";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Helper function to calculate efficiency percentage
 */
const calculateEfficiency = (expected, actual) => {
  if (!expected || !actual) return 0;
  return Math.round((expected / actual) * 100);
};
