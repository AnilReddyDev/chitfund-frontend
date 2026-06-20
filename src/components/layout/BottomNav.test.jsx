import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import BottomNav from "./BottomNav";
import { AppContext } from "../../context/AppContext";

function renderNav(role) {
  return render(
    <MemoryRouter>
      <AppContext.Provider value={{ role, groupId: 7 }}>
        <BottomNav />
      </AppContext.Provider>
    </MemoryRouter>,
  );
}

describe("BottomNav", () => {
  it("hides audit and users navigation for collectors", () => {
    renderNav("COLLECTOR");

    expect(screen.queryByLabelText("Audit")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Users")).not.toBeInTheDocument();
  });

  it("shows owner-only navigation for owners", () => {
    renderNav("OWNER");

    expect(screen.getByLabelText("Audit")).toBeInTheDocument();
    expect(screen.getByLabelText("Users")).toBeInTheDocument();
  });
});
