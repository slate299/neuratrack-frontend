// src/pages/Reports.tsx

import { useState } from "react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Share2,
  Calendar,
  TrendingUp,
  Award,
  X,
  Link2,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { seizureService } from "@/services/seizure.service";
import { medicationService } from "@/services/medication.service";
import { reportService } from "@/services/report.service";
import toast from "react-hot-toast";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [shareableLinks, setShareableLinks] = useState<any[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  // Fetch data
  const { data: seizures = [], isLoading: seizuresLoading } = useQuery({
    queryKey: ["seizures", dateRange],
    queryFn: async () => {
      const response = await seizureService.getRecent(100);
      return response.filter((s) => {
        const date = new Date(s.occurredAt);
        return date >= dateRange.start && date <= dateRange.end;
      });
    },
  });

  const { data: medications = [] } = useQuery({
    queryKey: ["medications"],
    queryFn: () => medicationService.getMedications(),
  });

  const { data: adherence } = useQuery({
    queryKey: ["adherence"],
    queryFn: () => medicationService.getAdherence(30),
  });

  // Calculate summary
  const summary = {
    totalSeizures: seizures.length,
    averageDuration:
      seizures.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) /
      (seizures.length || 1),
    mostCommonTrigger: (() => {
      const triggers = seizures.flatMap((s) => s.triggers || []);
      const triggerCount = new Map();
      triggers.forEach((t) =>
        triggerCount.set(t, (triggerCount.get(t) || 0) + 1),
      );
      return triggerCount.size > 0
        ? Array.from(triggerCount.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : "None";
    })(),
    adherenceRate: adherence?.summary.adherenceRate || 0,
    seizureFreeStreak: reportService.calculateSeizureFreeStreak(seizures),
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await reportService.generatePDFReport({
        seizures,
        medications,
        adherence: adherence?.data || [],
        dateRange,
        summary,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neuratrack-report-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const seizureData = seizures.map((s) => ({
      Date: new Date(s.occurredAt).toLocaleDateString(),
      Time: new Date(s.occurredAt).toLocaleTimeString(),
      Duration: s.durationSeconds || "",
      Type: s.seizureType || "",
      Triggers: s.triggers?.join(", ") || "",
      Notes: s.notes || "",
    }));

    reportService.exportToCSV(
      seizureData,
      `seizures-${new Date().toISOString().split("T")[0]}`,
      ["Date", "Time", "Duration", "Type", "Triggers", "Notes"],
    );

    toast.success("CSV exported successfully!");
  };

  const handleShareLink = async () => {
    try {
      const link = await reportService.generateShareableLink(1, 7);
      setShareLink(link);
      await navigator.clipboard.writeText(link);
      toast.success("Shareable link copied to clipboard! Expires in 7 days.");
    } catch (error) {
      toast.error("Failed to generate shareable link");
    }
  };

  const handleSendEmailReport = async () => {
    if (!doctorEmail || !doctorEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSendingEmail(true);
    try {
      const blob = await reportService.generatePDFReport({
        seizures,
        medications,
        adherence: adherence?.data || [],
        dateRange,
        summary,
      });

      const sent = await reportService.sendReportViaEmail(doctorEmail, blob);

      if (sent) {
        toast.success(`Report sent successfully to ${doctorEmail}!`);
        setShowEmailModal(false);
        setDoctorEmail("");
      } else {
        const subject = `NeuraTrack Report - ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`;
        const body = `Please find attached my NeuraTrack report.\n\nDate Range: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}\nTotal Seizures: ${summary.totalSeizures}\nSeizure-Free Streak: ${summary.seizureFreeStreak} days\nAdherence Rate: ${summary.adherenceRate}%\n\nThis report was generated by NeuraTrack.`;

        reportService.sendReportViaMailTo(doctorEmail, subject, body);
        toast.success(
          "Opening your email client. Please attach the report manually.",
        );
        setShowEmailModal(false);
        setDoctorEmail("");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Add this function after handleSendEmailReport
  const fetchShareableLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const links = await reportService.getShareableLinks();
      setShareableLinks(links);
    } catch (error) {
      console.error("Failed to fetch shareable links:", error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleRevokeLink = async (linkId: number) => {
    if (
      window.confirm(
        "Are you sure you want to revoke this shareable link? It will no longer work.",
      )
    ) {
      try {
        await reportService.revokeShareableLink(linkId);
        toast.success("Link revoked successfully");
        fetchShareableLinks(); // Refresh list
      } catch (error) {
        toast.error("Failed to revoke link");
      }
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  // Add useEffect to fetch links on page load
  useEffect(() => {
    fetchShareableLinks();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary-600" />
            Reports & Export
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate reports and share your data with healthcare providers
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-600" />
          Date Range
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start.toISOString().split("T")[0]}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: new Date(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end.toISOString().split("T")[0]}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: new Date(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Seizures
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalSeizures}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Seizure-Free Streak
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.seizureFreeStreak} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Adherence Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.adherenceRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Most Common Trigger
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {summary.mostCommonTrigger}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Export Data
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <FileText className="h-5 w-5" />
            {isGenerating ? "Generating..." : "PDF Report"}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            CSV Export
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            Share with Doctor
          </button>
        </div>

        {shareLink && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Shareable link (expires in 7 days):
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400 break-all">
              {shareLink}
            </p>
          </div>
        )}
      </div>

      {/* Shareable Links Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary-600" />
            Shareable Links
          </h2>
          <button
            onClick={handleShareLink}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
          >
            <Link2 className="h-4 w-4" />
            Generate New Link
          </button>
        </div>

        {shareLink && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">
              ✓ New link generated!
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
              {shareLink}
            </p>
          </div>
        )}

        {isLoadingLinks ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Loading links...
            </p>
          </div>
        ) : shareableLinks.length === 0 ? (
          <div className="text-center py-8">
            <Link2 className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No shareable links yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Generate a link to share your report with your doctor
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shareableLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {link.url}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Expires: {new Date(link.expiresAt).toLocaleDateString()}
                    </span>
                    {link.accessedAt && (
                      <span>
                        Accessed:{" "}
                        {new Date(link.accessedAt).toLocaleDateString()}
                      </span>
                    )}
                    {link.isExpired && (
                      <span className="text-red-500">Expired</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleCopyLink(link.url)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {!link.isExpired && (
                    <button
                      onClick={() => handleRevokeLink(link.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                      title="Revoke link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Send Report to Doctor
              </h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setDoctorEmail("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doctor's Email Address
              </label>
              <input
                type="email"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                placeholder="doctor@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The report will be sent as a PDF attachment.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendEmailReport}
                disabled={isSendingEmail}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isSendingEmail ? "Sending..." : "Send Report"}
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setDoctorEmail("");
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seizure History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Seizure History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Triggers
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {seizures.slice(0, 10).map((seizure) => (
                <tr key={seizure.id}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(seizure.occurredAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(seizure.occurredAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {seizure.durationSeconds
                      ? `${seizure.durationSeconds}s`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {seizure.seizureType || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {seizure.triggers?.join(", ") || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
