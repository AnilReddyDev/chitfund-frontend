import { describe, expect, it, beforeEach } from "vitest";
import { PERMISSIONS, hasPermission, hasAnyPermission } from "./permissions";

describe("permissions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("grants owner every frontend permission", () => {
    expect(hasPermission(PERMISSIONS.USER_MANAGE, "OWNER")).toBe(true);
    expect(hasPermission(PERMISSIONS.AUDIT_VIEW, "OWNER")).toBe(true);
  });

  it("maps backend permission names to frontend constants", () => {
    expect(hasPermission("VIEW_AUDIT_LOGS", "ACCOUNTANT")).toBe(true);
    expect(hasPermission("MANAGE_USERS", "MANAGER")).toBe(false);
  });

  it("reads persisted role when no role is passed", () => {
    localStorage.setItem("role", "COLLECTOR");

    expect(hasPermission(PERMISSIONS.PAYMENT_CREATE)).toBe(true);
    expect(hasPermission(PERMISSIONS.REPORT_EXPORT)).toBe(false);
  });

  it("supports any-permission checks", () => {
    expect(
      hasAnyPermission([PERMISSIONS.AUDIT_VIEW, PERMISSIONS.PAYMENT_CREATE], "COLLECTOR"),
    ).toBe(true);
  });
});
