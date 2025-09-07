// /app/api/invoices/[id]/pdf/route.ts
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { invoicesCollection } from "@/lib/collections";
import { toInvoiceDTO } from "@/types/invoices";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { message, ...extra } }, { status });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) return jsonError("Invalid id", 400);

  try {
    const col = await invoicesCollection();
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (!doc) return jsonError("Not found", 404);
    const inv = toInvoiceDTO(doc as any);

    // Build a clean PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4
    const { width } = page.getSize();

    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    // Header bar
    page.drawRectangle({
      x: 0, y: 790, width, height: 30,
      color: rgb(0.31, 0.34, 0.90),
    });
    page.drawText("INVOICE", {
      x: 40, y: 798,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Company / App name
    page.drawText("Freelancers Dashboard", { x: 40, y: 760, size: 18, font: fontBold, color: rgb(0.12, 0.12, 0.12) });
    page.drawText("billing@freelancers-dashboard.app", { x: 40, y: 742, size: 10, font, color: rgb(0.4, 0.4, 0.4) });

    // Invoice meta box
    const boxX = 360, boxY = 700, boxW = 195, boxH = 90;
    page.drawRectangle({ x: boxX, y: boxY, width: boxW, height: boxH, color: rgb(0.97, 0.98, 1) });
    page.drawRectangle({ x: boxX, y: boxY, width: boxW, height: boxH, borderColor: rgb(0.85, 0.87, 0.98), borderWidth: 1 });

    page.drawText("Invoice #", { x: boxX + 12, y: boxY + 62, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(inv.invoiceId, { x: boxX + 12, y: boxY + 46, size: 14, font: fontBold, color: rgb(0.12, 0.12, 0.12) });

    page.drawText("Status", { x: boxX + 12, y: boxY + 28, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(inv.status, { x: boxX + 12, y: boxY + 12, size: 12, font: fontBold, color: inv.status === "Paid" ? rgb(0.2, 0.6, 0.2) : rgb(0.85, 0.6, 0.15) });

    // Bill to
    page.drawText("Bill To", { x: 40, y: 700, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(inv.client, { x: 40, y: 682, size: 12, font, color: rgb(0.15, 0.15, 0.15) });

    // Table header
    const thY = 635;
    page.drawRectangle({ x: 40, y: thY, width: width - 80, height: 28, color: rgb(0.96, 0.97, 1) });
    page.drawText("Description", { x: 52, y: thY + 9, size: 11, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
    page.drawText("Amount", { x: width - 170, y: thY + 9, size: 11, font: fontBold, color: rgb(0.15, 0.15, 0.15) });

    // Single line item (since your model is flat; customize as needed)
    const rowY = thY - 34;
    page.drawText(`Service / Project — ${inv.invoiceId}`, { x: 52, y: rowY + 9, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(formatCurrency(inv.amount), { x: width - 170, y: rowY + 9, size: 11, font, color: rgb(0.2, 0.2, 0.2) });

    // Total
    const totalY = rowY - 40;
    page.drawText("Total", { x: width - 240, y: totalY, size: 12, font: fontBold, color: rgb(0.12, 0.12, 0.12) });
    page.drawText(formatCurrency(inv.amount), { x: width - 170, y: totalY, size: 12, font: fontBold, color: rgb(0.12, 0.12, 0.12) });

    // Footer
    page.drawText("Thank you for your business!", { x: 40, y: 80, size: 11, font, color: rgb(0.35, 0.35, 0.35) });

    const pdfBytes = await pdf.save();
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${inv.invoiceId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return jsonError("PDF generation failed", 500, { detail: e?.message });
  }
}

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}
