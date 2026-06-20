import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import RoleGuard from "./RoleGuard";
import { AppContext } from "../../context/AppContext";
import { PERMISSIONS } from "../../utils/permissions";

function renderGuard(role) {
  return render(
    <MemoryRouter>
      <AppContext.Provider value={{ role, loading: false }}>
        <RoleGuard permissions={[PERMISSIONS.AUDIT_VIEW]}>
          <h1>Audit content</h1>
        </RoleGuard>
      </AppContext.Provider>
    </MemoryRouter>,
  );
}

describe("RoleGuard", () => {
  it("allows authorized roles", () => {
    renderGuard("ACCOUNTANT");

    expect(screen.getByText("Audit content")).toBeInTheDocument();
  });

  it("shows access denied for unauthorized roles", () => {
    renderGuard("COLLECTOR");

    expect(screen.getByText("Access denied")).toBeInTheDocument();
  });
});
