export default function LedgerExport({
  groupId,
  groupName = "",
  members = [],
  months = [],
  children,
}) {
  const handleDownload = () => {
    if (!groupId) {
      alert("Select a group first");
      return;
    }

    if (!members.length || !months.length) {
      alert("No ledger data available to export");
      return;
    }

    const csv = buildLedgerCsv({ groupId, groupName, members, months });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `ledger-${slugify(groupName || `group-${groupId}`)}-detailed.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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

function buildLedgerCsv({ groupId, groupName, members, months }) {
  const generatedAt = new Date();
  const monthSummaries = months.map((month) => summarizeMonth(month, members));
  const memberSummaries = members.map((member) => summarizeMember(member, months));
  const totalExpectedCells = members.length * months.length;
  const totalPaidCells = memberSummaries.reduce((sum, member) => sum + member.paidCount, 0);
  const totalPendingCells = Math.max(0, totalExpectedCells - totalPaidCells);
  const totalRecordedAmount = memberSummaries.reduce(
    (sum, member) => sum + member.recordedAmount,
    0,
  );
  const rows = [];

  rows.push(["ChitFund Ledger Export"]);
  rows.push(["Group Name", groupName || `Group ${groupId}`]);
  rows.push(["Group ID", groupId]);
  rows.push(["Generated At", generatedAt.toLocaleString("en-IN")]);
  rows.push(["Members", members.length]);
  rows.push(["Months", months.length]);
  rows.push([]);

  rows.push(["Overall Summary"]);
  rows.push(["Metric", "Value"]);
  rows.push(["Expected Payment Slots", totalExpectedCells]);
  rows.push(["Paid Slots", totalPaidCells]);
  rows.push(["Pending Slots", totalPendingCells]);
  rows.push(["Collection Completion", `${percentage(totalPaidCells, totalExpectedCells)}%`]);
  rows.push(["Recorded Amount", totalRecordedAmount || ""]);
  rows.push([]);

  rows.push(["Month Summary"]);
  rows.push([
    "Month",
    "Paid Members",
    "Pending Members",
    "Completion %",
    "Recorded Amount",
  ]);
  monthSummaries.forEach((month) => {
    rows.push([
      month.label,
      month.paidCount,
      month.pendingCount,
      `${month.completionRate}%`,
      month.recordedAmount || "",
    ]);
  });
  rows.push([]);

  rows.push(["Member Summary"]);
  rows.push([
    "Member ID",
    "Member Name",
    "Paid Months",
    "Pending Months",
    "Completion %",
    "Recorded Amount",
    "Pending Month List",
  ]);
  memberSummaries.forEach((member) => {
    rows.push([
      member.memberId,
      member.name,
      member.paidCount,
      member.pendingCount,
      `${member.completionRate}%`,
      member.recordedAmount || "",
      member.pendingMonths.join(" | "),
    ]);
  });
  rows.push([]);

  rows.push(["Payment Matrix"]);
  rows.push([
    "Member ID",
    "Member Name",
    "Paid Months",
    "Pending Months",
    "Completion %",
    ...months.flatMap((month) => {
      const label = formatMonth(month);
      return [`${label} Status`, `${label} Mode`, `${label} Date`];
    }),
  ]);
  members.forEach((member) => {
    const summary = summarizeMember(member, months);

    rows.push([
      member.memberId,
      member.name || `Member ${member.memberId}`,
      summary.paidCount,
      summary.pendingCount,
      `${summary.completionRate}%`,
      ...months.flatMap((month) => {
        const payment = findPayment(member, month);
        return [
          payment?.paid ? "PAID" : "PENDING",
          readPaymentMode(payment),
          readPaymentDate(payment),
        ];
      }),
    ]);
  });
  rows.push([]);

  rows.push(["Detailed Payment Rows"]);
  rows.push([
    "Member ID",
    "Member Name",
    "Month",
    "Status",
    "Amount",
    "Payment Mode",
    "Payment Date",
  ]);
  members.forEach((member) => {
    months.forEach((month) => {
      const payment = findPayment(member, month);

      rows.push([
        member.memberId,
        member.name || `Member ${member.memberId}`,
        formatMonth(month),
        payment?.paid ? "PAID" : "PENDING",
        readPaymentAmount(payment) || "",
        readPaymentMode(payment),
        readPaymentDate(payment),
      ]);
    });
  });

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

function summarizeMonth(month, members) {
  const paidPayments = members
    .map((member) => findPayment(member, month))
    .filter((payment) => payment?.paid);
  const paidCount = paidPayments.length;
  const pendingCount = Math.max(0, members.length - paidCount);

  return {
    label: formatMonth(month),
    paidCount,
    pendingCount,
    completionRate: percentage(paidCount, members.length),
    recordedAmount: paidPayments.reduce(
      (sum, payment) => sum + readPaymentAmount(payment),
      0,
    ),
  };
}

function summarizeMember(member, months) {
  const payments = months.map((month) => ({
    month,
    payment: findPayment(member, month),
  }));
  const paidPayments = payments.filter(({ payment }) => payment?.paid);
  const pendingMonths = payments
    .filter(({ payment }) => !payment?.paid)
    .map(({ month }) => formatMonth(month));

  return {
    memberId: member.memberId,
    name: member.name || `Member ${member.memberId}`,
    paidCount: paidPayments.length,
    pendingCount: pendingMonths.length,
    completionRate: percentage(paidPayments.length, months.length),
    pendingMonths,
    recordedAmount: paidPayments.reduce(
      (sum, { payment }) => sum + readPaymentAmount(payment),
      0,
    ),
  };
}

function findPayment(member, month) {
  return (member.payments || []).find((payment) => String(payment.month) === String(month));
}

function readPaymentAmount(payment) {
  const amount = Number(
    payment?.amount ??
      payment?.paidAmount ??
      payment?.paymentAmount ??
      payment?.monthlyPremium ??
      0,
  );

  return Number.isFinite(amount) ? amount : 0;
}

function readPaymentMode(payment) {
  return (
    payment?.paymentMode ||
    payment?.mode ||
    payment?.method ||
    payment?.paymentMethod ||
    payment?.payMode ||
    payment?.paidMode ||
    ""
  );
}

function readPaymentDate(payment) {
  const value =
    payment?.paidAt ||
    payment?.paymentDate ||
    payment?.paymentDateTime ||
    payment?.paidDate ||
    payment?.date ||
    payment?.transactionDate ||
    payment?.createdAt ||
    "";

  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN");
}

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function formatMonth(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

function escapeCsv(value) {
  const text = String(value ?? "");

  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "ledger";
}
