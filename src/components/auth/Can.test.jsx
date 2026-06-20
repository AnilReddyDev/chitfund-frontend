import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Can from "./Can";
import { AppContext } from "../../context/AppContext";
import { PERMISSIONS } from "../../utils/permissions";

function renderWithRole(role, ui) {
  return render(
    <AppContext.Provider value={{ role }}>
      {ui}
    </AppContext.Provider>,
  );
}

describe("Can", () => {
  it("renders children when permission is granted", () => {
    renderWithRole("OWNER", (
      <Can permissions={[PERMISSIONS.USER_MANAGE]}>
        <button type="button">Delete</button>
      </Can>
    ));

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("hides children when permission is denied", () => {
    renderWithRole("VIEWER", (
      <Can permissions={[PERMISSIONS.PAYMENT_CREATE]}>
        <button type="button">Collect</button>
      </Can>
    ));

    expect(screen.queryByRole("button", { name: "Collect" })).not.toBeInTheDocument();
  });
});
