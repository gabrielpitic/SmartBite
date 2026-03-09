import Link from "next/link";
import PDFImport from "@/components/admin/PDFImport";

export default function ImportPage() {
  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/menu"
          className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-bold"
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Import Menu</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Upload a .txt extract or paste your menu text — AI handles the rest
          </p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 flex gap-3">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <div>
          <p className="text-sm font-bold text-amber-800">This will replace your entire menu</p>
          <p className="text-xs text-amber-600 mt-0.5">
            All existing dishes will be deleted and replaced with the ones extracted from the PDF.
            Review carefully before confirming.
          </p>
        </div>
      </div>

      <PDFImport />
    </div>
  );
}
