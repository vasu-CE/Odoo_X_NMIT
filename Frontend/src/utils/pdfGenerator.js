import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Sanitizes CSS to remove unsupported color functions and properties
 */
const sanitizeCSS = (element) => {
  // Remove problematic CSS properties that cause html2canvas issues
  const problematicProperties = [
    "oklab",
    "oklch",
    "color-mix",
    "hwb",
    "lab",
    "lch",
    "backdrop-filter",
    "filter",
    "text-shadow",
    "box-shadow",
  ];

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    const computedStyle = window.getComputedStyle(node);
    const style = node.style;

    // Reset problematic properties
    problematicProperties.forEach((prop) => {
      if (computedStyle[prop] && computedStyle[prop] !== "none") {
        style[prop] = "none";
      }
    });

    // Convert color values to hex
    if (computedStyle.color && computedStyle.color.includes("oklab")) {
      style.color = "#000000";
    }
    if (
      computedStyle.backgroundColor &&
      computedStyle.backgroundColor.includes("oklab")
    ) {
      style.backgroundColor = "#ffffff";
    }
  }
};

/**
 * Generates a PDF from a React component
 * @param {string} elementId - The ID of the element to convert to PDF
 * @param {string} filename - The name of the PDF file
 * @param {Object} options - Additional options for PDF generation
 */
export const generatePDF = async (
  elementId,
  filename = "report.pdf",
  options = {}
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Create a clone of the element to avoid modifying the original
    const clonedElement = element.cloneNode(true);

    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.style.width = element.offsetWidth + "px";
    tempContainer.style.backgroundColor = "#ffffff";
    tempContainer.style.fontFamily = "Arial, sans-serif";

    // Add the cloned element to the temporary container
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // Sanitize CSS to remove problematic properties
    sanitizeCSS(tempContainer);

    // Convert CSS to compatible format by removing problematic properties
    const style = document.createElement("style");
    style.textContent = `
      * {
        color: #000000 !important;
        background-color: transparent !important;
        border-color: #cccccc !important;
        box-shadow: none !important;
        text-shadow: none !important;
        filter: none !important;
        backdrop-filter: none !important;
      }
      .bg-white, .bg-gray-50, .bg-gray-100 {
        background-color: #ffffff !important;
      }
      .text-gray-900, .text-gray-700, .text-gray-600 {
        color: #000000 !important;
      }
      .border-gray-200, .border-gray-300, .border-gray-400 {
        border-color: #cccccc !important;
      }
      .bg-blue-100, .bg-green-100, .bg-yellow-100, .bg-red-100, .bg-orange-100 {
        background-color: #f0f0f0 !important;
        border: 1px solid #cccccc !important;
      }
    `;
    tempContainer.appendChild(style);

    // Default options with better compatibility
    const defaultOptions = {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
      ignoreElements: (element) => {
        // Skip elements that might cause issues
        return (
          element.classList.contains("print:hidden") ||
          element.tagName === "SCRIPT" ||
          element.tagName === "STYLE"
        );
      },
      ...options,
    };

    // Create canvas from HTML element
    const canvas = await html2canvas(tempContainer, defaultOptions);

    // Clean up temporary elements
    document.body.removeChild(tempContainer);

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    let position = 0;

    // Add image to PDF
    pdf.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(filename);

    return { success: true, message: "PDF generated successfully" };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Generates a PDF report for work orders analysis
 * @param {Array} workOrders - Array of work orders data
 * @param {Object} filters - Current filter values
 * @param {string} filename - The name of the PDF file
 */
export const generateWorkOrdersPDF = async (
  workOrders,
  filters,
  filename = "work-orders-analysis.pdf"
) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");

    // Set up fonts and colors
    pdf.setFont("helvetica");
    pdf.setFontSize(20);
    pdf.setTextColor(40, 40, 40);

    // Title
    pdf.text("Work Orders Analysis Report", 20, 30);

    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);

    // Filters applied
    if (
      filters.searchTerm ||
      filters.operationFilter !== "all" ||
      filters.workCenterFilter !== "all" ||
      filters.statusFilter !== "all"
    ) {
      pdf.setFontSize(12);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Filters Applied:", 20, 55);

      let yPos = 65;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);

      if (filters.searchTerm) {
        pdf.text(`Search: ${filters.searchTerm}`, 20, yPos);
        yPos += 8;
      }
      if (filters.operationFilter !== "all") {
        pdf.text(`Operation: ${filters.operationFilter}`, 20, yPos);
        yPos += 8;
      }
      if (filters.workCenterFilter !== "all") {
        pdf.text(`Work Center: ${filters.workCenterFilter}`, 20, yPos);
        yPos += 8;
      }
      if (filters.statusFilter !== "all") {
        pdf.text(`Status: ${filters.statusFilter.replace("_", " ")}`, 20, yPos);
        yPos += 8;
      }
      yPos += 10;
    } else {
      yPos = 60;
    }

    // Summary statistics
    const totalExpectedDuration = workOrders.reduce(
      (sum, wo) => sum + (wo.estimatedTimeMinutes || 0),
      0
    );
    const totalRealDuration = workOrders.reduce(
      (sum, wo) => sum + (wo.realDuration || 0),
      0
    );

    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    pdf.text("Summary:", 20, yPos);

    yPos += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Total Work Orders: ${workOrders.length}`, 20, yPos);
    yPos += 8;
    pdf.text(
      `Total Expected Duration: ${formatDuration(totalExpectedDuration)}`,
      20,
      yPos
    );
    yPos += 8;
    pdf.text(
      `Total Real Duration: ${formatDuration(totalRealDuration)}`,
      20,
      yPos
    );
    yPos += 15;

    // Table setup - Excel-like formatting
    const colWidths = [40, 35, 40, 25, 30, 30, 25];
    const startX = 15;
    const headerY = yPos;
    const rowHeight = 10;
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);

    // Draw complete table border
    pdf.setLineWidth(0.8);
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(
      startX,
      headerY - 6,
      totalWidth,
      (workOrders.length + 2) * rowHeight + 4
    );

    // Draw header background
    pdf.setFillColor(68, 114, 196); // Excel blue header
    pdf.rect(startX, headerY - 6, totalWidth, rowHeight + 2, "F");

    // Draw all vertical lines
    let currentX = startX;
    for (let i = 0; i <= colWidths.length; i++) {
      if (i > 0) currentX += colWidths[i - 1];
      pdf.line(
        currentX,
        headerY - 6,
        currentX,
        headerY + (workOrders.length + 1) * rowHeight - 2
      );
    }

    // Draw all horizontal lines
    for (let i = 0; i <= workOrders.length + 1; i++) {
      const lineY = headerY - 6 + i * rowHeight;
      pdf.line(startX, lineY, startX + totalWidth, lineY);
    }

    // Header text (white text on blue background)
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");

    let textX = startX + 3;
    pdf.text("Operation", textX, headerY + 1);
    textX += colWidths[0];
    pdf.text("Work Center", textX, headerY + 1);
    textX += colWidths[1];
    pdf.text("Product", textX, headerY + 1);
    textX += colWidths[2];
    pdf.text("Qty", textX, headerY + 1);
    textX += colWidths[3];
    pdf.text("Expected", textX, headerY + 1);
    textX += colWidths[4];
    pdf.text("Real", textX, headerY + 1);
    textX += colWidths[5];
    pdf.text("Status", textX, headerY + 1);

    // Table data - Excel-like formatting
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    let currentY = headerY + rowHeight + 2;
    const pageHeight = 280; // Leave some margin at bottom

    workOrders.forEach((workOrder, index) => {
      // Check if we need a new page
      if (currentY + rowHeight > pageHeight) {
        pdf.addPage();
        currentY = 20;

        // Redraw complete table structure on new page
        pdf.setLineWidth(0.8);
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(
          startX,
          currentY - 6,
          totalWidth,
          (workOrders.length - index + 1) * rowHeight + 4
        );

        // Redraw header
        pdf.setFillColor(68, 114, 196);
        pdf.rect(startX, currentY - 6, totalWidth, rowHeight + 2, "F");

        // Redraw all lines
        let newCurrentX = startX;
        for (let i = 0; i <= colWidths.length; i++) {
          if (i > 0) newCurrentX += colWidths[i - 1];
          pdf.line(
            newCurrentX,
            currentY - 6,
            newCurrentX,
            currentY + (workOrders.length - index + 1) * rowHeight - 2
          );
        }

        for (let i = 0; i <= workOrders.length - index + 1; i++) {
          const lineY = currentY - 6 + i * rowHeight;
          pdf.line(startX, lineY, startX + totalWidth, lineY);
        }

        // Redraw header text
        pdf.setFontSize(11);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        let textX = startX + 3;
        pdf.text("Operation", textX, currentY + 1);
        textX += colWidths[0];
        pdf.text("Work Center", textX, currentY + 1);
        textX += colWidths[1];
        pdf.text("Product", textX, currentY + 1);
        textX += colWidths[2];
        pdf.text("Qty", textX, currentY + 1);
        textX += colWidths[3];
        pdf.text("Expected", textX, currentY + 1);
        textX += colWidths[4];
        pdf.text("Real", textX, currentY + 1);
        textX += colWidths[5];
        pdf.text("Status", textX, currentY + 1);

        currentY += rowHeight + 2;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
      }

      // Excel-like alternating row colors
      if (index % 2 === 0) {
        pdf.setFillColor(240, 248, 255); // Light blue alternating rows
        pdf.rect(startX + 1, currentY - 2, totalWidth - 2, rowHeight, "F");
      }

      // Truncate text to fit in columns
      const operation = truncateText(workOrder.operationName || "N/A", 35);
      const workCenter = truncateText(workOrder.workCenterName || "N/A", 30);
      const product = truncateText(
        workOrder.manufacturingOrder?.product?.name || "N/A",
        35
      );
      const quantity = workOrder.manufacturingOrder?.quantity || "N/A";
      const expected = formatDuration(workOrder.estimatedTimeMinutes);
      const real = formatDuration(workOrder.realDuration);
      const status = workOrder.status?.replace("_", " ") || "N/A";

      // Set text color
      pdf.setTextColor(0, 0, 0);

      // Add text to cells with proper alignment
      let textX = startX + 3;
      pdf.text(operation, textX, currentY + 4);
      textX += colWidths[0];
      pdf.text(workCenter, textX, currentY + 4);
      textX += colWidths[1];
      pdf.text(product, textX, currentY + 4);
      textX += colWidths[2];
      pdf.text(quantity.toString(), textX, currentY + 4);
      textX += colWidths[3];
      pdf.text(expected, textX, currentY + 4);
      textX += colWidths[4];
      pdf.text(real, textX, currentY + 4);
      textX += colWidths[5];

      // Status with Excel-like formatting
      const statusColor = getStatusColor(workOrder.status);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(statusColor.r, statusColor.g, statusColor.b);
      pdf.text(status, textX, currentY + 4);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      currentY += rowHeight;
    });

    // Add totals footer - Excel-like formatting
    if (workOrders.length > 0) {
      // Draw totals row background (darker blue)
      pdf.setFillColor(31, 73, 125);
      pdf.rect(startX + 1, currentY - 2, totalWidth - 2, rowHeight, "F");

      // Calculate totals
      const totalExpectedDuration = workOrders.reduce(
        (sum, wo) => sum + (wo.estimatedTimeMinutes || 0),
        0
      );
      const totalRealDuration = workOrders.reduce(
        (sum, wo) => sum + (wo.realDuration || 0),
        0
      );

      // Totals text (white text on dark blue background)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);

      let totalsTextX = startX + 3;
      pdf.text("TOTAL", totalsTextX, currentY + 4);
      totalsTextX += colWidths[0] + colWidths[1] + colWidths[2];
      pdf.text(workOrders.length.toString(), totalsTextX, currentY + 4);
      totalsTextX += colWidths[3];
      pdf.text(
        formatDuration(totalExpectedDuration),
        totalsTextX,
        currentY + 4
      );
      totalsTextX += colWidths[4];
      pdf.text(formatDuration(totalRealDuration), totalsTextX, currentY + 4);
      totalsTextX += colWidths[5];
      pdf.text("orders", totalsTextX, currentY + 4);
    }

    // Save the PDF
    pdf.save(filename);

    return { success: true, message: "PDF generated successfully" };
  } catch (error) {
    console.error("Error generating work orders PDF:", error);
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
 * Helper function to truncate text to fit in PDF columns
 */
const truncateText = (text, maxLength) => {
  if (!text) return "N/A";
  return text.length > maxLength
    ? text.substring(0, maxLength - 3) + "..."
    : text;
};

/**
 * Helper function to get status color for PDF
 */
const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return { r: 180, g: 150, b: 0 }; // Yellow
    case "IN_PROGRESS":
      return { r: 0, g: 100, b: 200 }; // Blue
    case "PAUSED":
      return { r: 200, g: 120, b: 0 }; // Orange
    case "COMPLETED":
      return { r: 0, g: 150, b: 0 }; // Green
    case "CANCELLED":
      return { r: 200, g: 0, b: 0 }; // Red
    default:
      return { r: 100, g: 100, b: 100 }; // Gray
  }
};
