import { EXPORT_HEIGHT, EXPORT_WIDTH } from "@/lib/export/image";

export async function savePdf(jpegUrls: string[], filename: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [EXPORT_WIDTH, EXPORT_HEIGHT],
    compress: true,
  });
  jpegUrls.forEach((url, i) => {
    if (i > 0) pdf.addPage([EXPORT_WIDTH, EXPORT_HEIGHT], "landscape");
    pdf.addImage(url, "JPEG", 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
  });
  pdf.save(filename);
}
