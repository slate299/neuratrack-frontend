// src/services/report.service.ts

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Seizure, Medication, MedicationAdherence } from "@/types";
import { axiosInstance } from "@/lib/axios";

export interface ReportData {
  seizures: Seizure[];
  medications: Medication[];
  adherence: MedicationAdherence[];
  dateRange: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSeizures: number;
    averageDuration: number;
    mostCommonTrigger: string;
    adherenceRate: number;
    seizureFreeStreak: number;
  };
}

export const reportService = {
  /**
   * Generate PDF Report
   */
  generatePDFReport: async (data: ReportData): Promise<Blob> => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(24);
    doc.setTextColor(14, 165, 233); // Primary color
    doc.text("NeuraTrack Report", pageWidth / 2, 20, { align: "center" });

    // Date Range
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `${data.dateRange.start.toLocaleDateString()} - ${data.dateRange.end.toLocaleDateString()}`,
      pageWidth / 2,
      30,
      { align: "center" },
    );

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", 14, 45);

    const summaryData = [
      ["Total Seizures", data.summary.totalSeizures.toString()],
      ["Average Duration", `${data.summary.averageDuration || 0} seconds`],
      ["Most Common Trigger", data.summary.mostCommonTrigger || "None"],
      ["Adherence Rate", `${data.summary.adherenceRate}%`],
      ["Seizure-Free Streak", `${data.summary.seizureFreeStreak} days`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "striped",
      headStyles: { fillColor: [14, 165, 233] },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 10;

    // Seizure History
    doc.setFontSize(14);
    doc.text("Seizure History", 14, currentY);
    currentY += 5;

    if (data.seizures.length > 0) {
      const seizureData = data.seizures.map((s) => [
        new Date(s.occurredAt).toLocaleDateString(),
        new Date(s.occurredAt).toLocaleTimeString(),
        s.durationSeconds ? `${s.durationSeconds}s` : "N/A",
        s.seizureType || "Unknown",
        s.triggers?.join(", ") || "None",
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Date", "Time", "Duration", "Type", "Triggers"]],
        body: seizureData,
        theme: "striped",
        headStyles: { fillColor: [14, 165, 233] },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.text("No seizures recorded in this period.", 14, currentY);
      currentY += 10;
    }

    // Medications Section
    doc.setFontSize(14);
    doc.text("Current Medications", 14, currentY);
    currentY += 5;

    if (data.medications.length > 0) {
      const medData = data.medications.map((m) => [
        m.name,
        m.dosage,
        m.frequency,
        m.times?.join(", ") || "N/A",
        m.active ? "Active" : "Inactive",
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Name", "Dosage", "Frequency", "Times", "Status"]],
        body: medData,
        theme: "striped",
        headStyles: { fillColor: [14, 165, 233] },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.text("No medications added.", 14, currentY);
      currentY += 10;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated on ${new Date().toLocaleString()} - NeuraTrack`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
    }

    return doc.output("blob");
  },

  /**
   * Export to CSV
   */
  exportToCSV: (data: any[], filename: string, headers: string[]) => {
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(","));

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header.toLowerCase()] || "";
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(",") ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Generate shareable link for doctor
   */
  generateShareableLink: async (
    userId: number,
    expiryDays: number = 7,
  ): Promise<string> => {
    const response = await axiosInstance.post("/api/reports/share", {
      userId,
      expiryDays,
    });
    return response.data.shareableLink;
  },

  /**
   * Get all shareable links for current user
   */
  getShareableLinks: async (): Promise<any[]> => {
    const response = await axiosInstance.get("/api/reports/links");
    return response.data.data;
  },

  /**
   * Revoke a shareable link
   */
  revokeShareableLink: async (linkId: number): Promise<void> => {
    await axiosInstance.delete(`/api/reports/links/${linkId}`);
  },

  /**
   * Get shared report data by token (public)
   */
  getSharedReport: async (token: string): Promise<any> => {
    const response = await axiosInstance.get(`/api/reports/shared/${token}`);
    return response.data.data;
  },

  /**
   * Calculate seizure-free streak
   */
  calculateSeizureFreeStreak: (seizures: Seizure[]): number => {
    if (seizures.length === 0) return 0;

    const sortedSeizures = [...seizures].sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

    const lastSeizureDate = new Date(sortedSeizures[0].occurredAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastSeizureDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - lastSeizureDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return Math.max(0, diffDays);
  },

  /**
   * Send report via email to doctor
   */
  sendReportViaEmail: async (
    doctorEmail: string,
    reportBlob: Blob,
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("doctorEmail", doctorEmail);
      formData.append(
        "report",
        reportBlob,
        `neuratrack-report-${new Date().toISOString().split("T")[0]}.pdf`,
      );

      const response = await axiosInstance.post(
        "/api/reports/email",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data.success;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  },

  /**
   * Send report via email using mailto (fallback)
   */
  sendReportViaMailTo: (doctorEmail: string, subject: string, body: string) => {
    const mailtoLink = `mailto:${doctorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  },
};
