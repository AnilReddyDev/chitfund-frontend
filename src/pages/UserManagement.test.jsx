import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import UserManagement from "./UserManagement";
import { AppContext } from "../context/AppContext";

vi.mock("../services/userService", () => ({
  userService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

import { userService } from "../services/userService";

function renderPage() {
  return render(
    <MemoryRouter>
      <AppContext.Provider value={{ user: { username: "owner" }, logout: vi.fn() }}>
        <UserManagement />
      </AppContext.Provider>
    </MemoryRouter>,
  );
}

describe("UserManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders users returned by the service", async () => {
    userService.list.mockResolvedValue({
      content: [
        {
          id: "1",
          username: "owner@example.com",
          role: "OWNER",
          active: true,
          createdAt: "2026-01-01T10:00:00Z",
        },
      ],
      totalPages: 1,
    });

    renderPage();

    expect((await screen.findAllByText("owner@example.com")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("OWNER").length).toBeGreaterThan(0);
  });

  it("shows an empty state", async () => {
    userService.list.mockResolvedValue({ content: [], totalPages: 1 });

    renderPage();

    await waitFor(() => expect(screen.getByText("No users found")).toBeInTheDocument());
  });
});
