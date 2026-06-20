# ChitFund Implementation and Design Guide

This document describes the current ChitFund frontend, the design principles behind it, and the major implementation choices. It is intended for future development, handoff, review, and maintenance.

## Product Overview

ChitFund is a React/Vite frontend for managing chit fund groups. The app supports the core operating workflow of a chit fund:

- Create and browse chit groups.
- Maintain a shared member directory.
- Assign members to a selected group.
- Track month-wise member payments.
- Record auction winners and bid outcomes.
- View group collection, auction, member, and profit metrics.
- Export ledger data for accounting, auditing, and collection follow-up.
- Manage role-based user access.
- Review and export audit logs.

The frontend expects a backend API at:

```js
http://localhost:8080/api
```

The shared Axios client is configured in `src/services/api.js`.

## Technology Stack

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 3
- Axios
- Recharts
- Lucide React icons
- React Hot Toast
- ExcelJS for `.xlsx` ledger exports
- Vitest, Testing Library, and jsdom for frontend tests

Common scripts:

```bash
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

## Application Structure

Important entry points:

- `src/main.jsx`: mounts the app and wraps it in `AppProvider`.
- `src/App.jsx`: owns routing, protected route boundaries, bottom navigation, and toast mounting.
- `src/context/AppContext.jsx`: owns authentication state and global app context.
- `src/services/api.js`: Axios client with auth token and `401` handling.
- `src/utils/permissions.js`: role-to-permission mapping and permission helpers.
- `src/components/auth/RoleGuard.jsx`: route-level permission guard.
- `src/components/auth/Can.jsx`: component-level permission gate.
- `src/components/layout/PageShell.jsx`: shared page frame, hero, and state panel components.
- `src/hooks/useGroupMeta.js`: shared group name/date metadata loader.
- `src/components/ledger/LedgerExport.jsx`: Excel and CSV ledger export implementation.
- `src/services/userService.js`: user management API wrapper.
- `src/services/auditService.js`: audit log API wrapper.

## Routing Design

The URL is the source of truth for group-specific screens. Pages read `groupId` from route params rather than relying only on local storage.

Current main routes:

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | `GroupPortal` | Browse/create groups |
| `/group/:groupId` | redirect | Redirects to `/group/:groupId/members` |
| `/group/:groupId/members` | `GroupMembersHistory` | Assign/view group members |
| `/group/:groupId/ledger` | `Ledger` | Payment matrix and exports |
| `/group/:groupId/dashboard` | `Dashboard` | Operational summary |
| `/group/:groupId/auction` | `Auction` | Auction recording/history |
| `/members` | `MemberHistory` | Global member directory |
| `/settings/users` | `UserManagement` | Owner-only user management |
| `/settings/audit-logs` | `AuditLogs` | Audit log search, detail, and export |
| `/login` | `Login` | Authentication |

`BottomNav` uses `useGroup()` to remember the most recent group for tab navigation, but group-specific pages should continue using `useParams()` for data loading.

Protected pages are wrapped first with `ProtectedRoute` and then, where needed, `RoleGuard`. Navigation items are filtered through the central permission helper so unauthorized routes are hidden for UX. Backend authorization remains the source of truth.

## Design Principles

The UI is built for repeated operational use, not for marketing presentation. The design should remain quiet, scan-friendly, and fast to operate.

Core principles:

- Prefer dense, readable operational screens over decorative layouts.
- Use the shared `PageShell`, `PageHero`, and `StatePanel` pattern for consistency.
- Keep loading, error, empty, and data states explicit on every data-driven page.
- Use route params as the source of truth for group-specific API calls.
- Keep buttons and controls recognizable with Lucide icons where useful.
- Avoid one-off modal/page styling when a shared local pattern exists.
- Make exports accounting-friendly: structured tables, totals, filters, frozen headers, and clear statuses.
- Never hardcode role checks in page components. Use permission constants, `RoleGuard`, and `Can`.

## Role-Based UI Authorization

Frontend authorization is intentionally a UX layer only. The backend remains responsible for enforcing access.

Supported roles:

- `OWNER`
- `MANAGER`
- `COLLECTOR`
- `ACCOUNTANT`
- `VIEWER`

Authentication state now carries:

```js
{
  token,
  user,
  role
}
```

`authService` persists the JWT, user object, and role in local storage. `AppContext` exposes `token`, `user`, `role`, `isAuthenticated`, `login`, and `logout`.

Permissions are centralized in:

```txt
src/utils/permissions.js
```

The permission utility exports:

- `PERMISSIONS`
- `ROLE_PERMISSIONS`
- `ROLES`
- `hasPermission(permission, role)`
- `hasAnyPermission(permissions, role)`

It also maps backend-style permission names such as `VIEW_AUDIT_LOGS` and `MANAGE_USERS` to frontend constants such as `AUDIT_VIEW` and `USER_MANAGE`.

Route-level protection:

```jsx
<RoleGuard permissions={[PERMISSIONS.AUDIT_VIEW]}>
  <AuditLogs />
</RoleGuard>
```

Component-level protection:

```jsx
<Can permissions={[PERMISSIONS.PAYMENT_CREATE]}>
  <DeleteButton />
</Can>
```

`AccessDenied` provides a consistent permission failure screen for guarded routes.

## Permission-Aware Navigation

`src/components/layout/BottomNav.jsx` filters its items using `hasAnyPermission`.

Examples:

- `OWNER` sees all settings and operational routes.
- `COLLECTOR` can use dashboard, member/payment viewing, and payment collection flows, but cannot see audit logs, exports, or user management.
- `ACCOUNTANT` can see reporting/export and audit surfaces, but cannot see auction management.
- `VIEWER` sees read-only operational routes and no payment actions.

## Group Metadata Loading

Group names and creation dates are loaded consistently through `src/hooks/useGroupMeta.js`.

The hook:

- Reads the active `groupId` from route params.
- Fetches groups from `/groups`.
- Finds the matching group.
- Exposes:
  - `group`
  - `groupName`
  - `displayName`
  - `createdAt`
  - `createdLabel`
  - `subtitle`

This avoids each page inventing its own fallback such as `Group {id}`. Ledger, Dashboard, Auction, and Group Members now share the same subtitle behavior.

## Ledger Page

`src/pages/Ledger.jsx` loads the full ledger from:

```http
GET /ledger/full?groupId={groupId}
```

Expected ledger data:

- `members`: member rows with payment arrays.
- `months`: month identifiers used as matrix columns.
- Optional group name fields such as `groupName`, `group.name`, or `name`.

The page renders:

- A matrix where rows are members and columns are months.
- Paid cells as disabled.
- Unpaid cells as buttons that open `PaymentModal` only when the user has `PAYMENT_CREATE`.
- Export controls through `LedgerExport` only when the user has `REPORT_EXPORT`.

Read-only users can still review the ledger matrix, but payment recording and exports are hidden.

## Ledger Export Implementation

The primary ledger export is now an Excel workbook (`.xlsx`) generated client-side with ExcelJS.

File:

```txt
src/components/ledger/LedgerExport.jsx
```

ExcelJS is lazy-loaded only when the user clicks the Excel export button:

```js
const { default: ExcelJS } = await import("exceljs");
```

This keeps the initial app bundle smaller. Vite still emits a large lazy ExcelJS chunk, which is expected for workbook generation.

The export UI provides:

- `Excel`: full multi-sheet workbook.
- `CSV`: lightweight matrix-style alternative.

## Excel Workbook Sheets

### 1. Summary

Contains group-level accounting summary:

- Group Name
- Group ID
- Chit Amount
- Monthly Premium
- Duration
- Total Members
- Total Expected Collection
- Total Collected Amount
- Total Pending Amount
- Collection Completion Percentage
- Generated Timestamp

Formatting:

- Currency formatting for money fields.
- Percentage formatting for completion.
- Timestamp formatting.
- Header styling.
- Filter on header row.
- Auto-sized columns.

### 2. Member Ledger

One row per member:

- Member Name
- Phone Number
- Total Months
- Paid Months Count
- Pending Months Count
- Amount Paid
- Pending Amount
- Last Payment Date
- Next Due Month
- Overdue Months
- Member Status

Includes a totals row for paid/pending counts and paid/pending amounts.

### 3. Payment Matrix

Cross-tab sheet:

- Rows: members.
- Columns: months.
- Cell values: `Paid`, `Due`, or `Overdue`.
- Summary columns:
  - Paid Count
  - Pending Count
  - Amount Paid
  - Amount Due

Status colors:

- Green for `Paid`.
- Yellow for `Due`.
- Red for `Overdue`.

The sheet includes native Excel conditional formatting rules and also applies direct cell fills as a compatibility fallback.

### 4. Transaction History

One row per paid payment:

- Payment Date
- Member Name
- Applicable Month
- Amount
- Payment Mode
- Transaction ID
- Receipt Number
- Collected By
- Remarks

The exporter reads several possible backend field names for transaction metadata, such as `transactionId`, `referenceId`, `utr`, `receiptNumber`, `collectedBy`, and `remarks`.

### 5. Monthly Collection

One row per month:

- Month
- Expected Amount
- Collected Amount
- Pending Amount
- Paid Members Count
- Pending Members Count
- Completion Percentage

Includes totals for expected, collected, pending, paid count, and pending count.

## Export Data Rules

Monthly premium resolution:

1. Prefer `group.monthlyPremium`.
2. Fall back to a paid payment amount if group premium is missing.
3. Use `0` if no reliable premium exists.

Payment amount resolution:

1. Prefer payment amount fields:
   - `amount`
   - `paidAmount`
   - `paymentAmount`
   - `monthlyPremium`
2. If a payment is marked paid but amount is missing, use monthly premium as fallback.
3. Unpaid payments count as `0` collected.

Payment status resolution:

- `Paid`: a matching payment exists and `payment.paid` is true.
- `Overdue`: no paid payment and the month is before the current calendar month.
- `Due`: no paid payment and the month is current/future.

## Excel-Friendly Features

The workbook is designed for accounting and audit workflows:

- Separate sheets by purpose.
- Frozen header rows.
- Filters on all sheets.
- Auto-sized columns.
- Currency number formats.
- Date formats.
- Percentage formats.
- Totals rows.
- Conditional formatting on payment status.
- Structured transaction history for audit trails.

## CSV Alternative

CSV remains available as a lightweight export. It intentionally contains less structure than the Excel workbook and is meant for quick sharing or simple imports.

The CSV export includes:

- Basic group metadata.
- Member rows.
- Month status columns.
- Paid/pending counts.
- Amount paid/due columns.

For accounting, audit, or collection follow-up, use the Excel export.

## Authentication and API Behavior

`src/services/api.js` attaches the bearer token from `authService` to every request.

If the backend returns `401`, the interceptor logs the user out and redirects to `/login`.

Protected pages are wrapped in `ProtectedRoute`.

Role-based page access is layered on top with `RoleGuard`. This does not replace backend authorization; it only prevents users from seeing frontend screens and actions they cannot use.

## User Management

Route:

```txt
/settings/users
```

Page:

```txt
src/pages/UserManagement.jsx
```

Access:

- `USER_MANAGE`
- Currently mapped to `OWNER`

API service:

```txt
src/services/userService.js
```

Endpoints:

```http
GET /users
POST /users
PUT /users/{id}
PATCH /users/{id}/status
```

The page provides:

- Server-side pagination parameters (`page`, `size`, `sort`).
- Search input.
- Role filter.
- User table with name, email, role, status, last login, created date, and actions.
- Create user modal.
- Edit user modal for role updates.
- Activate/deactivate status toggle.
- Loading skeletons.
- Empty and error states.
- Toast notifications for create/update/status changes.

The frontend accepts both array-style responses and paged responses using `content`, so it can tolerate simple and Spring Page-style backend payloads.

## Audit Logs

Route:

```txt
/settings/audit-logs
```

Page:

```txt
src/pages/AuditLogs.jsx
```

Access:

- `AUDIT_VIEW`
- Currently mapped to `OWNER`, `MANAGER`, and `ACCOUNTANT`

API service:

```txt
src/services/auditService.js
```

Endpoints:

```http
GET /audit-logs
GET /audit-logs/{id}
```

The audit log table supports:

- Server-side pagination parameters (`page`, `size`, `sort`).
- Search.
- Date range filters.
- Entity type filter.
- Action filter.
- User filter through `performedBy`.

Visible columns:

- Timestamp
- User
- Role
- Action
- Entity Type
- Entity ID
- IP Address

Clicking a row opens a side drawer. The drawer fetches the detailed record when an ID is available and displays:

- Event metadata.
- Before changes JSON.
- After changes JSON.
- User agent when present.
- Field-level change summary.

Field changes are classified as:

- Added
- Updated
- Removed

JSON values are rendered with indentation in scrollable code panels to keep large audit payloads readable.

## Audit Export

Audit logs can be exported to Excel from the audit page.

The export:

- Includes the active filters.
- Requests up to 1000 matching rows.
- Uses ExcelJS via lazy import.
- Produces one `Audit Logs` sheet with timestamp, user, role, action, entity type, entity ID, and IP address.
- Shows a loading label while exporting.
- Uses toast notifications for success and failure.

## Permission Gates on Existing Screens

Existing pages now use `Can`, `hasPermission`, or route guards for UX-level authorization:

- Groups: create group FAB and empty-state create action require `GROUP_MANAGE`.
- Members: create member FAB and empty-state create action require `MEMBER_MANAGE`.
- Group Members: assign member FAB and empty-state action require `MEMBER_MANAGE`.
- Ledger: payment cell actions require `PAYMENT_CREATE`; export controls require `REPORT_EXPORT`.
- Auctions: record auction form requires `AUCTION_MANAGE`; auction history remains visible to roles with `AUCTION_VIEW`.
- Dashboard: auction widgets and shortcuts are hidden when the role lacks auction permissions; quick actions are filtered by permission.
- Bottom navigation: routes are hidden when the role lacks the corresponding view/manage permission.

Use the permission constants for new work. Do not branch directly on role names inside components.

## Frontend Testing

Vitest is configured in `vite.config.js` with jsdom and Testing Library setup in:

```txt
src/test/setup.js
```

Current focused test coverage includes:

- `hasPermission()` and backend permission aliases.
- `RoleGuard`.
- `Can`.
- Hidden navigation items.
- User management page rendering and empty state.
- Audit logs page rendering and empty state.

Run:

```bash
npm test
```

## Implementation Guidelines

When adding features:

- Keep API calls close to the page that owns the data.
- Reuse shared hooks such as `useGroupMeta` when page metadata must be consistent.
- Keep generated exports deterministic and explicit.
- Prefer structured data transformation helpers over inline mapping inside JSX.
- Keep UI controls compact and action-oriented.
- Run `npm run lint`, `npm test`, and `npm run build` before handing off.

## Known Notes

- ExcelJS adds a large lazy-loaded chunk. This is acceptable because it loads only when exporting Excel.
- `npm install` reports dependency audit warnings. Review with `npm audit` before production release policy decisions.
- Export accuracy depends on backend payment fields. The current exporter tolerates several field-name variants, but backend consistency will improve audit reliability.
- RBAC checks in the frontend are for UX only. Backend permissions must remain the source of truth.
