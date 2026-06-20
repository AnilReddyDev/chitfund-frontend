import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AuditLogs from "./AuditLogs";
import { AppContext } from "../context/AppContext";

vi.mock("../services/auditService", () => ({
  auditService: {
    list: vi.fn(),
    get: vi.fn(),
  },
}));

import { auditService } from "../services/auditService";

function renderPage() {
  return render(
    <MemoryRouter>
      <AppContext.Provider value={{ user: { username: "manager" }, logout: vi.fn() }}>
        <AuditLogs />
      </AppContext.Provider>
    </MemoryRouter>,
  );
}

describe("AuditLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders audit rows returned by the service", async () => {
    auditService.list.mockResolvedValue({
      content: [
        {
          id: "a1",
          createdAt: "2026-01-01T10:00:00Z",
          performedByName: "admin",
          performedByRole: "OWNER",
          action: "CREATE",
          entityType: "Group",
          entityId: "42",
          ipAddress: "127.0.0.1",
        },
      ],
      totalPages: 1,
    });

    renderPage();

    expect(await screen.findByText("admin")).toBeInTheDocument();
    expect(screen.getAllByText("Group").length).toBeGreaterThan(0);
  });

  it("shows an empty state", async () => {
    auditService.list.mockResolvedValue({ content: [], totalPages: 1 });

    renderPage();

    await waitFor(() => expect(screen.getByText("No audit logs found")).toBeInTheDocument());
  });
});
