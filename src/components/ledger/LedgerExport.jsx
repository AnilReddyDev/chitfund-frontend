import React from 'react'
import api from "../../services/api";
import useGroup from "../../hooks/useGroup";

export default function LedgerExport() {

    const groupId = useGroup();
    const handleDownload = async () => {
  try {
    const res = await api.get("/ledger/export/csv", {
      params: { groupId },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ledger.csv");
    document.body.appendChild(link);
    link.click();

  } catch (err) {
    console.error(err);
    alert("Download failed");
  }
};
  return (
    <button
  onClick={handleDownload}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Download CSV
</button>
  )
}
