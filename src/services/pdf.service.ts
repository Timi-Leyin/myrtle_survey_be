/**
 * PDF Service
 * Generates Wealth Blueprint PDF documents using PDFKit
 */

const PDFDocument = require("pdfkit");
import { formatNumber, formatCurrency } from "../utils/helpers";

// Brand colors
const PRIMARY_COLOR = "#27dc85";
const TEXT_COLOR = "#333333";
const LIGHT_GRAY = "#f5f5f5";

/**
 * Generate Wealth Blueprint PDF
 * Returns a formatted PDF buffer with the wealth blueprint narrative
 */
export async function generateWealthBlueprintPDF(
  narrative: string,
  userData: {
    fullName: string;
    email: string;
    createdAt: Date;
  },
  analysisData: {
    netWorth: number;
    netWorthBand: string;
    riskScore: number;
    riskProfile: string;
    persona: string;
    portfolio: Record<string, any>;
  }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header with logo area
      doc
        .fillColor(PRIMARY_COLOR)
        .fontSize(32)
        .font("Helvetica-Bold")
        .text("MYRTLE WEALTH", { align: "center" })
        .moveDown(0.5);

      doc
        .fillColor(TEXT_COLOR)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Wealth Blueprint", { align: "center" })
        .moveDown(0.3)
        .fontSize(10)
        .font("Helvetica")
        .text("Personalized Financial Analysis Report", { align: "center" })
        .moveDown(1.5);

      // Personal Information Section
      doc
        .fillColor("#666666")
        .fontSize(9)
        .font("Helvetica")
        .text(`Report Generated: ${new Date(userData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, {
          align: "center",
        })
        .moveDown(0.8);

      doc
        .fillColor(TEXT_COLOR)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Client: ${userData.fullName}`, { align: "center" })
        .moveDown(0.3)
        .fontSize(9)
        .font("Helvetica")
        .text(userData.email, { align: "center" })
        .moveDown(1.5);

      // Divider
      doc
        .strokeColor(PRIMARY_COLOR)
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(1.5);

      // Financial Summary Box
      const summaryY = doc.y;
      doc
        .roundedRect(50, summaryY, 495, 100, 5)
        .fillColor(LIGHT_GRAY)
        .fill()
        .strokeColor(PRIMARY_COLOR)
        .lineWidth(2)
        .stroke();

      doc.y = summaryY + 15;

      doc
        .fillColor(PRIMARY_COLOR)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("FINANCIAL SUMMARY", 60, doc.y)
        .moveDown(0.8);

      const leftCol = 60;
      const rightCol = 300;
      const lineHeight = 18;

      doc
        .fillColor(TEXT_COLOR)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Net Worth:", leftCol, doc.y)
        .font("Helvetica")
        .text(`NGN ${formatNumber(analysisData.netWorth)}`, leftCol + 80, doc.y);

      doc.y += lineHeight;
      doc
        .font("Helvetica-Bold")
        .text("Category:", leftCol, doc.y)
        .font("Helvetica")
        .text(analysisData.netWorthBand, leftCol + 80, doc.y);

      doc.y += lineHeight;
      doc
        .font("Helvetica-Bold")
        .text("Risk Profile:", leftCol, doc.y)
        .font("Helvetica")
        .text(analysisData.riskProfile, leftCol + 80, doc.y);

      doc.y += lineHeight;
      doc
        .font("Helvetica-Bold")
        .text("Risk Score:", leftCol, doc.y)
        .font("Helvetica")
        .text(`${analysisData.riskScore}/28`, leftCol + 80, doc.y);

      doc.y += lineHeight;
      doc
        .font("Helvetica-Bold")
        .text("Persona:", leftCol, doc.y)
        .font("Helvetica")
        .text(analysisData.persona, leftCol + 80, doc.y);

      doc.y = summaryY + 100 + 20;

      // Narrative Section
      doc
        .fillColor(PRIMARY_COLOR)
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("YOUR WEALTH BLUEPRINT", { underline: true })
        .moveDown(1);

      // Clean narrative - remove emojis and special characters
      let cleanNarrative = narrative
        .replace(/[🌿🌱💚]/g, "") // Remove emojis
        .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
        .replace(/MYRTLE WEALTH BLUEPRINT.*?—/g, "") // Remove title line
        .trim();

      // Parse and format narrative with better structure
      const narrativeLines = cleanNarrative.split("\n").filter(line => line.trim());
      
      doc.fillColor(TEXT_COLOR).fontSize(10).font("Helvetica");
      
      narrativeLines.forEach((line) => {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) {
          doc.moveDown(0.5);
          return;
        }
        
        // Check if it's a section header (starts with number)
        if (/^\d+\./.test(trimmedLine)) {
          doc
            .moveDown(0.8)
            .font("Helvetica-Bold")
            .fontSize(12)
            .fillColor(PRIMARY_COLOR)
            .text(trimmedLine, { paragraphGap: 8 })
            .fillColor(TEXT_COLOR)
            .fontSize(10)
            .font("Helvetica");
        } else {
          doc.text(trimmedLine, { paragraphGap: 5, lineGap: 3, indent: 10 });
        }
      });
      
      doc.moveDown(1.5);

      // Portfolio Allocation Section
      doc
        .fillColor(PRIMARY_COLOR)
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("RECOMMENDED PORTFOLIO ALLOCATION", { underline: true })
        .moveDown(1);

      if (analysisData.portfolio.custom) {
        doc
          .fillColor(TEXT_COLOR)
          .fontSize(10)
          .font("Helvetica")
          .text("Custom allocation based on your unique profile.", { 
            paragraphGap: 8,
            indent: 10 
          })
          .text("Please contact your wealth advisor for personalized portfolio details tailored to your specific financial goals and circumstances.", {
            paragraphGap: 5,
            lineGap: 3,
            indent: 10,
          });
      } else {
        const portfolioItems = [];
        if (analysisData.portfolio.cash) portfolioItems.push({ label: "Cash", value: analysisData.portfolio.cash });
        if (analysisData.portfolio.income) portfolioItems.push({ label: "Income", value: analysisData.portfolio.income });
        if (analysisData.portfolio.growth) portfolioItems.push({ label: "Growth", value: analysisData.portfolio.growth });
        if (analysisData.portfolio.fx) portfolioItems.push({ label: "Foreign Exchange", value: analysisData.portfolio.fx });
        if (analysisData.portfolio.alternatives) portfolioItems.push({ label: "Alternatives", value: analysisData.portfolio.alternatives });

        portfolioItems.forEach((item) => {
          const yPos = doc.y;
          doc
            .fillColor(TEXT_COLOR)
            .fontSize(10)
            .font("Helvetica")
            .text(`${item.label}:`, 70, yPos)
            .font("Helvetica-Bold")
            .text(`${item.value}%`, 250, yPos);
          doc.y = yPos + 18;
        });
      }
      
      doc.moveDown(1.5);

      // Footer
      const pageHeight = doc.page.height;
      const footerY = pageHeight - 70;

      doc
        .strokeColor("#cccccc")
        .lineWidth(1)
        .moveTo(50, footerY)
        .lineTo(545, footerY)
        .stroke();

      doc
        .fillColor("#666666")
        .fontSize(8)
        .font("Helvetica")
        .text(
          `© ${new Date().getFullYear()} Myrtle Wealth. All rights reserved.`,
          50,
          footerY + 10,
          { align: "center", width: 495 }
        )
        .fontSize(7)
        .text(
          `This report is confidential and intended solely for ${userData.fullName}.`,
          50,
          footerY + 22,
          { align: "center", width: 495 }
        )
        .text(
          `For inquiries, visit: https://myrtle.portal.prod.mywealthcare.io`,
          50,
          footerY + 34,
          { align: "center", width: 495 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format portfolio for PDF display
 */
function formatPortfolioForPDF(portfolio: Record<string, any>): string {
  if (portfolio.custom) {
    return "Custom allocation based on your unique profile.\n\nPlease contact your wealth advisor for personalized portfolio details tailored to your specific financial goals and circumstances.";
  }

  const parts: string[] = [];
  if (portfolio.cash) parts.push(`• Cash: ${portfolio.cash}%`);
  if (portfolio.income) parts.push(`• Income: ${portfolio.income}%`);
  if (portfolio.growth) parts.push(`• Growth: ${portfolio.growth}%`);
  if (portfolio.fx) parts.push(`• Foreign Exchange: ${portfolio.fx}%`);
  if (portfolio.alternatives) parts.push(`• Alternatives: ${portfolio.alternatives}%`);

  return parts.join("\n") || "Portfolio allocation details";
}

/**
 * Get PDF filename
 */
export function getPDFFilename(fullName: string, id: string): string {
  const sanitizedName = fullName.replace(/[^a-zA-Z0-9]/g, "_");
  const date = new Date().toISOString().split("T")[0];
  return `Myrtle_Wealth_Blueprint_${sanitizedName}_${date}_${id.substring(0, 8)}.pdf`;
}

