"use client"

export default function PDFTestButton() {
  const testPDF = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://inventory-manager-api-ghana.vercel.app';
      const response = await fetch(`${backendUrl}/api/reports/pdf/test`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF');
      }

      // Open PDF in new tab
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
    } catch (error: any) {
      alert('PDF Error: ' + error.message);
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold text-gray-800 mb-2">📄 PDF Test</h3>
      <p className="text-sm text-gray-600 mb-3">Test PDF generation from your old project</p>
      <button
        onClick={testPDF}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
      >
        Generate Test PDF
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Tests the pdf-export.js integration
      </p>
    </div>
  )
}
