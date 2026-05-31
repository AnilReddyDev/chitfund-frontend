import api from "../../services/api";

export default function LedgerExport({ groupId, children }) {
  const handleDownload = async () => {
    if (!groupId) {
      alert("Select a group first");
      return;
    }

    try {
      const res = await api.get("/ledger/export/csv", {
        params: { groupId },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ledger-group-${groupId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
    >
      {children || "Download CSV"}
    </button>
  );
}
