import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

const CURRENCY_FORMAT = '"₹"#,##0';
const DATE_FORMAT = "dd-mmm-yyyy";
const STATUS_STYLES = {
  Paid: { fgColor: { argb: "FFDFF6DD" }, fontColor: { argb: "FF166534" } },
  Due: { fgColor: { argb: "FFFEF3C7" }, fontColor: { argb: "FF92400E" } },
  Overdue: { fgColor: { argb: "FFFEE2E2" }, fontColor: { argb: "FF991B1B" } },
};

export default function LedgerExport({
  groupId,
  groupName = "",
  group = {},
  members = [],
  months = [],
}) {
  const [exporting, setExporting] = useState(false);

  const assertExportable = () => {
    if (!groupId) {
      alert("Select a group first");
      return false;
    }

    if (!members.length || !months.length) {
      alert("No ledger data available to export");
      return false;
    }

    return true;
  };

  const handleExcelDownload = async () => {
    if (!assertExportable()) return;

    try {
      setExporting(true);
      const { default: ExcelJS } = await import("exceljs");
      const workbook = buildLedgerWorkbook({
        ExcelJS,
        groupId,
        groupName,
        group,
        members,
        months,
      });
      const buffer = await workbook.xlsx.writeBuffer();

      downloadBlob(
        buffer,
        `ledger-${slugify(groupName || `group-${groupId}`)}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    } catch (err) {
      console.error("Error exporting ledger workbook", err);
      alert("Could not export Excel report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleCsvDownload = () => {
    if (!assertExportable()) return;

    downloadBlob(
      `\ufeff${buildLedgerCsv({ groupId, groupName, group, members, months })}`,
      `ledger-${slugify(groupName || `group-${groupId}`)}-lite.csv`,
      "text/csv;charset=utf-8",
    );
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={handleExcelDownload}
        disabled={exporting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        <FileSpreadsheet size={16} />
        {exporting ? "Exporting..." : "Excel"}
      </button>
      <button
        type="button"
        onClick={handleCsvDownload}
        disabled={exporting}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        <Download size={16} />
        CSV
      </button>
    </div>
  );
}

function buildLedgerWorkbook({ ExcelJS, groupId, groupName, group, members, months }) {
  const workbook = new ExcelJS.Workbook();
  const generatedAt = new Date();
  const premium = resolveMonthlyPremium(group, members);
  const totalMembers = Number(group?.totalMembers || members.length);
  const duration = Number(group?.duration || months.length);
  const memberSummaries = members.map((member) =>
    summarizeMember(member, months, premium),
  );
  const monthSummaries = months.map((month) =>
    summarizeMonth(month, members, premium),
  );
  const transactions = buildTransactions(members, months, premium);
  const totalExpectedCollection = members.length * months.length * premium;
  const totalCollectedAmount = memberSummaries.reduce(
    (sum, member) => sum + member.amountPaid,
    0,
  );
  const totalPendingAmount = Math.max(
    0,
    totalExpectedCollection - totalCollectedAmount,
  );

  workbook.creator = "ChitFund";
  workbook.created = generatedAt;
  workbook.modified = generatedAt;

  addSummarySheet(workbook, {
    groupId,
    groupName,
    group,
    premium,
    duration,
    totalMembers,
    totalExpectedCollection,
    totalCollectedAmount,
    totalPendingAmount,
    generatedAt,
  });
  addMemberLedgerSheet(workbook, memberSummaries, months.length);
  addPaymentMatrixSheet(workbook, members, months, memberSummaries);
  addTransactionHistorySheet(workbook, transactions);
  addMonthlyCollectionSheet(workbook, monthSummaries);

  return workbook;
}

function addSummarySheet(workbook, data) {
  const sheet = workbook.addWorksheet("Summary", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const rows = [
    ["Metric", "Value"],
    ["Group Name", data.groupName || `Group ${data.groupId}`],
    ["Group ID", data.groupId],
    ["Chit Amount", numberOrBlank(data.group?.totalAmount)],
    ["Monthly Premium", data.premium],
    ["Duration", data.duration],
    ["Total Members", data.totalMembers],
    ["Total Expected Collection", data.totalExpectedCollection],
    ["Total Collected Amount", data.totalCollectedAmount],
    ["Total Pending Amount", data.totalPendingAmount],
    [
      "Collection Completion Percentage",
      percentage(data.totalCollectedAmount, data.totalExpectedCollection) / 100,
    ],
    ["Generated Timestamp", data.generatedAt],
  ];

  sheet.addRows(rows);
  sheet.autoFilter = "A1:B1";
  styleHeader(sheet.getRow(1));
  applyCurrencyFormat(sheet, ["B4", "B5", "B8", "B9", "B10"]);
  sheet.getCell("B11").numFmt = "0%";
  sheet.getCell("B12").numFmt = "dd-mmm-yyyy hh:mm";
  autoSizeColumns(sheet);
}

function addMemberLedgerSheet(workbook, memberSummaries, totalMonths) {
  const sheet = workbook.addWorksheet("Member Ledger", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const headers = [
    "Member Name",
    "Phone Number",
    "Total Months",
    "Paid Months Count",
    "Pending Months Count",
    "Amount Paid",
    "Pending Amount",
    "Last Payment Date",
    "Next Due Month",
    "Overdue Months",
    "Member Status",
  ];

  sheet.addRow(headers);
  memberSummaries.forEach((member) => {
    sheet.addRow([
      member.name,
      member.phone,
      totalMonths,
      member.paidCount,
      member.pendingCount,
      member.amountPaid,
      member.pendingAmount,
      member.lastPaymentDate || "",
      member.nextDueMonth,
      member.overdueMonths.join(", "),
      member.status,
    ]);
  });
  addTotalsRow(sheet, [
    "Total",
    "",
    "",
    sum(memberSummaries, "paidCount"),
    sum(memberSummaries, "pendingCount"),
    sum(memberSummaries, "amountPaid"),
    sum(memberSummaries, "pendingAmount"),
    "",
    "",
    "",
    "",
  ]);
  finishTableSheet(sheet, headers.length);
  formatColumn(sheet, 6, CURRENCY_FORMAT);
  formatColumn(sheet, 7, CURRENCY_FORMAT);
  formatColumn(sheet, 8, DATE_FORMAT);
}

function addPaymentMatrixSheet(workbook, members, months, memberSummaries) {
  const sheet = workbook.addWorksheet("Payment Matrix", {
    views: [{ state: "frozen", ySplit: 1, xSplit: 1 }],
  });
  const headers = [
    "Member Name",
    ...months.map(formatMonth),
    "Paid Count",
    "Pending Count",
    "Amount Paid",
    "Amount Due",
  ];

  sheet.addRow(headers);
  members.forEach((member, index) => {
    const summary = memberSummaries[index];
    const row = sheet.addRow([
      summary.name,
      ...months.map((month) => readPaymentStatus(member, month)),
      summary.paidCount,
      summary.pendingCount,
      summary.amountPaid,
      summary.pendingAmount,
    ]);

    months.forEach((month, monthIndex) => {
      styleStatusCell(row.getCell(monthIndex + 2), readPaymentStatus(member, month));
    });
  });
  addTotalsRow(sheet, [
    "Total",
    ...months.map((month) => `${countPaidMembers(members, month)} paid`),
    sum(memberSummaries, "paidCount"),
    sum(memberSummaries, "pendingCount"),
    sum(memberSummaries, "amountPaid"),
    sum(memberSummaries, "pendingAmount"),
  ]);
  addPaymentStatusConditionalFormatting(sheet, members.length, months.length);
  finishTableSheet(sheet, headers.length);
  formatColumn(sheet, headers.length - 1, CURRENCY_FORMAT);
  formatColumn(sheet, headers.length, CURRENCY_FORMAT);
}

function addTransactionHistorySheet(workbook, transactions) {
  const sheet = workbook.addWorksheet("Transaction History", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const headers = [
    "Payment Date",
    "Member Name",
    "Applicable Month",
    "Amount",
    "Payment Mode",
    "Transaction ID",
    "Receipt Number",
    "Collected By",
    "Remarks",
  ];

  sheet.addRow(headers);
  transactions.forEach((transaction) => {
    sheet.addRow([
      transaction.paymentDate || "",
      transaction.memberName,
      transaction.month,
      transaction.amount,
      transaction.paymentMode,
      transaction.transactionId,
      transaction.receiptNumber,
      transaction.collectedBy,
      transaction.remarks,
    ]);
  });
  addTotalsRow(sheet, ["Total", "", "", sum(transactions, "amount"), "", "", "", "", ""]);
  finishTableSheet(sheet, headers.length);
  formatColumn(sheet, 1, DATE_FORMAT);
  formatColumn(sheet, 4, CURRENCY_FORMAT);
}

function addMonthlyCollectionSheet(workbook, monthSummaries) {
  const sheet = workbook.addWorksheet("Monthly Collection", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const headers = [
    "Month",
    "Expected Amount",
    "Collected Amount",
    "Pending Amount",
    "Paid Members Count",
    "Pending Members Count",
    "Completion Percentage",
  ];

  sheet.addRow(headers);
  monthSummaries.forEach((month) => {
    sheet.addRow([
      month.label,
      month.expectedAmount,
      month.collectedAmount,
      month.pendingAmount,
      month.paidCount,
      month.pendingCount,
      month.completionRate / 100,
    ]);
  });
  addTotalsRow(sheet, [
    "Total",
    sum(monthSummaries, "expectedAmount"),
    sum(monthSummaries, "collectedAmount"),
    sum(monthSummaries, "pendingAmount"),
    sum(monthSummaries, "paidCount"),
    sum(monthSummaries, "pendingCount"),
    "",
  ]);
  finishTableSheet(sheet, headers.length);
  formatColumn(sheet, 2, CURRENCY_FORMAT);
  formatColumn(sheet, 3, CURRENCY_FORMAT);
  formatColumn(sheet, 4, CURRENCY_FORMAT);
  formatColumn(sheet, 7, "0%");
}

function buildLedgerCsv({ groupId, groupName, group, members, months }) {
  const premium = resolveMonthlyPremium(group, members);
  const memberSummaries = members.map((member) =>
    summarizeMember(member, months, premium),
  );
  const rows = [
    ["ChitFund Ledger Lite Export"],
    ["Group Name", groupName || `Group ${groupId}`],
    ["Group ID", groupId],
    ["Generated At", new Date().toLocaleString("en-IN")],
    [],
    ["Member Name", ...months.map(formatMonth), "Paid Count", "Pending Count", "Amount Paid", "Amount Due"],
  ];

  members.forEach((member, index) => {
    const summary = memberSummaries[index];
    rows.push([
      summary.name,
      ...months.map((month) => readPaymentStatus(member, month)),
      summary.paidCount,
      summary.pendingCount,
      summary.amountPaid,
      summary.pendingAmount,
    ]);
  });

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

function summarizeMonth(month, members, premium) {
  const paidPayments = members
    .map((member) => findPayment(member, month))
    .filter((payment) => payment?.paid);
  const paidCount = paidPayments.length;
  const pendingCount = Math.max(0, members.length - paidCount);
  const expectedAmount = members.length * premium;
  const collectedAmount = paidPayments.reduce(
    (total, payment) => total + readPaymentAmount(payment, premium),
    0,
  );

  return {
    label: formatMonth(month),
    expectedAmount,
    collectedAmount,
    pendingAmount: Math.max(0, expectedAmount - collectedAmount),
    paidCount,
    pendingCount,
    completionRate: percentage(collectedAmount, expectedAmount),
  };
}

function summarizeMember(member, months, premium) {
  const payments = months.map((month) => ({
    month,
    payment: findPayment(member, month),
    status: readPaymentStatus(member, month),
  }));
  const paidPayments = payments.filter(({ payment }) => payment?.paid);
  const pendingPayments = payments.filter(({ payment }) => !payment?.paid);
  const amountPaid = paidPayments.reduce(
    (total, { payment }) => total + readPaymentAmount(payment, premium),
    0,
  );
  const pendingAmount = pendingPayments.length * premium;
  const overdueMonths = payments
    .filter(({ status }) => status === "Overdue")
    .map(({ month }) => formatMonth(month));
  const nextDueMonth =
    pendingPayments.find(({ status }) => status === "Due")?.month ||
    pendingPayments[0]?.month ||
    "";
  const lastPaymentDate = paidPayments
    .map(({ payment }) => readPaymentDateObject(payment))
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    name: member.name || `Member ${member.memberId}`,
    phone: member.phone || member.mobile || member.phoneNumber || "",
    paidCount: paidPayments.length,
    pendingCount: pendingPayments.length,
    amountPaid,
    pendingAmount,
    lastPaymentDate,
    nextDueMonth: nextDueMonth ? formatMonth(nextDueMonth) : "",
    overdueMonths,
    status: resolveMemberStatus(pendingPayments.length, overdueMonths.length),
  };
}

function buildTransactions(members, months, premium) {
  return members.flatMap((member) =>
    months
      .map((month) => {
        const payment = findPayment(member, month);
        if (!payment?.paid) return null;

        return {
          paymentDate: readPaymentDateObject(payment),
          memberName: member.name || `Member ${member.memberId}`,
          month: formatMonth(month),
          amount: readPaymentAmount(payment, premium),
          paymentMode: readPaymentMode(payment),
          transactionId: readPaymentField(payment, [
            "transactionId",
            "transactionID",
            "referenceId",
            "referenceNo",
            "utr",
          ]),
          receiptNumber: readPaymentField(payment, [
            "receiptNumber",
            "receiptNo",
            "receipt",
          ]),
          collectedBy: readPaymentField(payment, [
            "collectedBy",
            "collector",
            "createdBy",
          ]),
          remarks: readPaymentField(payment, ["remarks", "remark", "notes", "note"]),
        };
      })
      .filter(Boolean),
  );
}

function finishTableSheet(sheet, columnCount) {
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columnCount },
  };
  styleHeader(sheet.getRow(1));
  autoSizeColumns(sheet);
}

function styleHeader(row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" },
  };
  row.alignment = { vertical: "middle" };
}

function styleStatusCell(cell, status) {
  const style = STATUS_STYLES[status];
  if (!style) return;

  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: style.fgColor,
  };
  cell.font = { bold: true, color: style.fontColor };
  cell.alignment = { horizontal: "center" };
}

function addPaymentStatusConditionalFormatting(sheet, memberCount, monthCount) {
  if (!memberCount || !monthCount) return;

  const fromCell = sheet.getCell(2, 2).address;
  const toCell = sheet.getCell(memberCount + 1, monthCount + 1).address;

  sheet.addConditionalFormatting({
    ref: `${fromCell}:${toCell}`,
    rules: [
      buildStatusRule("Paid", 1),
      buildStatusRule("Due", 2),
      buildStatusRule("Overdue", 3),
    ],
  });
}

function buildStatusRule(status, priority) {
  const style = STATUS_STYLES[status];

  return {
    type: "containsText",
    operator: "containsText",
    text: status,
    priority,
    style: {
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: style.fgColor,
      },
      font: { bold: true, color: style.fontColor },
    },
  };
}

function addTotalsRow(sheet, values) {
  const row = sheet.addRow(values);
  row.font = { bold: true };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };
}

function autoSizeColumns(sheet) {
  sheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const value = cell.value instanceof Date ? "00-Mmm-0000" : cell.value;
      maxLength = Math.max(maxLength, String(value ?? "").length);
    });
    column.width = Math.min(Math.max(maxLength + 2, 12), 28);
  });
}

function applyCurrencyFormat(sheet, cells) {
  cells.forEach((cellRef) => {
    sheet.getCell(cellRef).numFmt = CURRENCY_FORMAT;
  });
}

function formatColumn(sheet, columnNumber, format) {
  sheet.getColumn(columnNumber).eachCell((cell, rowNumber) => {
    if (rowNumber > 1) cell.numFmt = format;
  });
}

function findPayment(member, month) {
  return (member.payments || []).find(
    (payment) => String(payment.month) === String(month),
  );
}

function readPaymentStatus(member, month) {
  const payment = findPayment(member, month);
  if (payment?.paid) return "Paid";
  return isOverdueMonth(month) ? "Overdue" : "Due";
}

function readPaymentAmount(payment, fallbackAmount = 0) {
  const rawAmount =
    payment?.amount ??
    payment?.paidAmount ??
    payment?.paymentAmount ??
    payment?.monthlyPremium;
  const amount = Number(rawAmount);

  if (Number.isFinite(amount) && amount > 0) return amount;
  return payment?.paid ? fallbackAmount : 0;
}

function readPaymentMode(payment) {
  return readPaymentField(payment, [
    "paymentMode",
    "mode",
    "method",
    "paymentMethod",
    "payMode",
    "paidMode",
  ]);
}

function readPaymentField(payment, fields) {
  return fields.map((field) => payment?.[field]).find(Boolean) || "";
}

function readPaymentDateObject(payment) {
  const value =
    payment?.paidAt ||
    payment?.paymentDate ||
    payment?.paymentDateTime ||
    payment?.paidDate ||
    payment?.date ||
    payment?.transactionDate ||
    payment?.createdAt ||
    "";

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveMonthlyPremium(group, members) {
  const groupPremium = Number(group?.monthlyPremium);
  if (Number.isFinite(groupPremium) && groupPremium > 0) return groupPremium;

  const paidPayment = members
    .flatMap((member) => member.payments || [])
    .find((payment) => payment?.paid);
  const paymentPremium = Number(
    paidPayment?.monthlyPremium || paidPayment?.amount || paidPayment?.paidAmount,
  );

  return Number.isFinite(paymentPremium) && paymentPremium > 0
    ? paymentPremium
    : 0;
}

function resolveMemberStatus(pendingCount, overdueCount) {
  if (pendingCount === 0) return "Complete";
  if (overdueCount > 0) return "Overdue";
  return "Due";
}

function isOverdueMonth(month) {
  const date = new Date(month);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const paymentMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  return paymentMonth < currentMonth;
}

function countPaidMembers(members, month) {
  return members.filter((member) => findPayment(member, month)?.paid).length;
}

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function sum(items, field) {
  return items.reduce((total, item) => total + Number(item[field] || 0), 0);
}

function numberOrBlank(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : "";
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

function downloadBlob(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function slugify(value) {
  return (
    String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "ledger"
  );
}
