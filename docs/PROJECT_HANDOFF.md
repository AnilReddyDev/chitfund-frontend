# ChitFund Project Handoff

This document is the primary orientation file for future agents working on this repository. Read this before editing the app. It explains the product, architecture, routes, API assumptions, UI conventions, state-management rules, and known implementation details.

## 1. Product Summary

ChitFund is a React/Vite frontend for managing chit fund groups. The app lets the user:

- Create and browse chit groups.
- Maintain a global member directory.
- Assign saved members to a selected group.
- Track month-wise payment ledger for a group.
- Record auction winners and bid outcomes for a group.
- View a dashboard with collection/profit/member metrics and charts.
- Export a group ledger as CSV.

The frontend expects a backend API at:

```js
http://localhost:8080/api
```

Configured in:

- `src/services/api.js`

## 2. Tech Stack

Core:

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 3
- Axios
- Recharts
- Lucide React icons
- React Hot Toast

Scripts:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

The dev server currently uses:

```json
"dev": "vite --host"
```

## 3. Important Entry Points

- `src/main.jsx`
  - Mounts the React app.
  - Wraps `App` with `AppProvider`.

- `src/App.jsx`
  - Defines all routes.
  - Renders `BottomNav`.
  - Renders `Toaster`.

- `src/services/api.js`
  - Axios instance used by all API calls.

- `src/index.css`
  - Tailwind entry.
  - Contains global utility classes such as `.input` and `.field-input`.

## 4. Routing Map

Routes are defined in `src/App.jsx`.

| Path | Page | Purpose |
| --- | --- | --- |
| `/` | `GroupPortal` | Home page. Lists all chit groups. |
| `/group/:groupId` | `GroupMembersHistory` | Group members page. |
| `/group/:groupId/members` | `GroupMembersHistory` | Same group members page, explicit route. |
| `/group/:groupId/ledger` | `Ledger` | Payment matrix for selected group. |
| `/group/:groupId/dashboard` | `Dashboard` | Group metrics and charts. |
| `/group/:groupId/auction` | `Auction` | Auction form and auction history. |
| `/members` | `MemberHistory` | Global member directory. |
| `*` | `Navigate to "/"` | Fallback. |

## 5. Group ID State Rule

Group-specific pages must fetch data using the URL param:

```js
const { groupId } = useParams();
```

This is the source of truth for:

- `Dashboard`
- `Ledger`
- `Auction`
- `GroupMembersHistory`

`src/hooks/useGroup.js` still persists the latest `groupId` into localStorage and returns `groupId || stored`. Use it carefully.

Current intended usage:

- `BottomNav` uses `useGroup()` so tabs can link to the last selected group.
- Group-specific pages should prefer `useParams()` directly so rendered data always matches the URL.

Do not fetch group-specific page data from only localStorage. That can render the wrong group when the URL changes.

## 6. Shared UI Pattern

The app now uses a shared shell for consistent screens:

- `src/components/layout/PageShell.jsx`

Exports:

- `PageShell`
- `PageHero`
- `StatePanel`

Use this structure for new pages:

```jsx
<PageShell title="Page Title" subtitle="Context">
  <PageHero
    eyebrow="Section"
    title="Main Title"
    description="Short page description."
    icon={<SomeIcon size={22} />}
  />

  {/* loading / error / empty / data */}
</PageShell>
```

Page state order should be:

1. No required route param, if applicable.
2. Loading.
3. Error.
4. Empty state.
5. Data state.

Do not use `array.length === 0` as a loading check. Empty arrays can be valid successful API responses.

## 7. Current UI Conventions

Visual style:

- Dark slate page background.
- Orange/amber/emerald top gradient.
- White rounded cards with `rounded-lg`.
- Lucide icons for actions and page signals.
- Bottom sheet modals for create/add/assign/payment actions.
- Dense operational UI, not a marketing page.

Common classes:

- Use `field-input` for modern form fields.
- Use `Skeleton` for loading placeholders.
- Use `FAB` for primary floating add actions.
- Use `StatePanel` for empty/error/no-selection states.

Avoid:

- Returning skeletons just because an array is empty.
- Mixing old orange gradient page wrappers with the new shell.
- Creating different modal styles for each feature.
- Making group-specific API calls without checking `groupId`.

## 8. Page Responsibilities

### `src/pages/GroupPortal.jsx`

Home page.

Responsibilities:

- Fetch all groups from `GET /groups`.
- Show loading, error, empty, or group card list.
- Open `CreateGroupModal`.
- Refresh groups after create.

Important state:

- `groups`
- `loading`
- `error`
- `open`

Expected group fields:

```js
{
  id,
  name,
  totalAmount,
  monthlyPremium,
  totalMembers,
  membersCount,
  duration,
  startMonth
}
```

`totalMembers` and `membersCount` are both tolerated in `GroupCard`.

### `src/pages/MemberHistory.jsx`

Global member directory.

Responsibilities:

- Fetch all members from `GET /members`.
- Show saved members.
- Open `AddMemberModal`.
- Refresh member list after add.

Expected member fields:

```js
{
  id,
  name,
  phone
}
```

### `src/pages/GroupMembersHistory.jsx`

Members assigned to a selected group.

Responsibilities:

- Read `groupId` from URL.
- Fetch group-member mappings from `GET /group-members/:groupId`.
- Fetch global members from `GET /members`.
- Display assigned members with names/phones by joining group member IDs against the global member list.
- Open `AssignMemberModal`.
- Refresh after assignment.

Expected group-member fields:

```js
{
  memberId
}
```

The page stores assigned group member IDs in `members`.

### `src/pages/Ledger.jsx`

Payment ledger for selected group.

Responsibilities:

- Read `groupId` from URL.
- Fetch full ledger from `GET /ledger/full?groupId=...`.
- Render a horizontal payment matrix.
- Let user tap unpaid cells to open `PaymentModal`.
- Refresh ledger after payment without full page loading.
- Export CSV via `LedgerExport`.

Expected ledger payload:

```js
{
  members: [
    {
      memberId,
      name,
      payments: [
        {
          month,
          paid
        }
      ]
    }
  ],
  months: ["2026-01-01", "2026-02-01"]
}
```

Paid cells are disabled to avoid reopening the payment modal for already-paid entries.

### `src/pages/Dashboard.jsx`

Metrics and charts for selected group.

Responsibilities:

- Read `groupId` from URL.
- Fetch metrics from `GET /dashboard?groupId=...`.
- Fetch chart data from `GET /dashboard/chart?groupId=...`.
- Render metric cards and Recharts graphs.

Expected dashboard payload:

```js
{
  totalCollection,
  totalProfit,
  totalMembers,
  pendingPayments,
  currentMonth,
  lastWinner
}
```

Expected chart payload:

```js
[
  {
    month,
    collection,
    profit
  }
]
```

### `src/pages/Auction.jsx`

Auction form and history for selected group.

Responsibilities:

- Read `groupId` from URL.
- Fetch group members from `GET /group-members/:groupId`.
- Fetch all members from `GET /members` to resolve names.
- Fetch auction history from `GET /auction/:groupId`.
- Submit auction to `POST /auction` with params.
- Disable members who already won.
- Refresh auction history after successful submission.

POST request shape:

```js
api.post("/auction", null, {
  params: {
    groupId,
    month: Number(month),
    winnerId: Number(winner),
    bidAmount: Number(bidAmount),
  },
});
```

Expected auction fields:

```js
{
  id,
  month,
  winnerMemberId,
  payoutAmount,
  profit
}
```

## 9. Component Responsibilities

### Layout

- `Header.jsx`
  - Sticky top header used by `PageShell`.
  - Accepts `title` and optional `subtitle`.

- `BottomNav.jsx`
  - Persistent bottom navigation.
  - Uses latest selected group for group-specific tab links.
  - If no group is known, group-specific tabs route to `/`.

- `PageShell.jsx`
  - Shared page wrapper and state UI helpers.

### Group Components

- `GroupCard.jsx`
  - Displays group summary and navigates to `/group/:id/members`.
  - Formats INR currency.
  - Tolerates missing optional fields.

- `CreateGroupModal.jsx`
  - Creates a group with:
    - `name`
    - `totalAmount`
    - `monthlyPremium`
    - `totalMembers`
    - `duration`
    - `startMonth`
  - Calls `POST /groups`.
  - Awaits `refresh()` before closing.

- `AssignMemberModal.jsx`
  - Fetches all members.
  - Accepts `existingMembers` as an array of member IDs.
  - Calls `POST /group-members` with `{ groupId, memberId }`.
  - Closes after successful assignment.

### Member Components

- `AddMemberModal.jsx`
  - Adds a new member with `name` and `phone`.
  - Calls `POST /members`.
  - Awaits refresh before close.

### Ledger Components

- `LedgerExport.jsx`
  - Accepts `groupId` prop.
  - Calls `GET /ledger/export/csv?groupId=...`.
  - Downloads `ledger-group-${groupId}.csv`.

- `PaymentModal.jsx`
  - Collects amount and payment mode.
  - Calls `POST /payments`.
  - Uses toast notifications.
  - Awaits `onSuccess()` before closing.

- `PaymentRow.jsx`
  - Older/simple payment row component.
  - Currently not central to the matrix ledger UI.

### UI Components

- `FAB.jsx`
  - Floating plus button.

- `Skeleton.jsx`
  - Generic loading placeholder.

- `Button.jsx` and `Card.jsx`
  - Older generic UI components still used in some legacy places.
  - Newer pages mostly use direct Tailwind classes and `PageShell`.

## 10. API Endpoint Summary

Known frontend API usage:

| Method | Endpoint | Used By | Notes |
| --- | --- | --- | --- |
| `GET` | `/groups` | GroupPortal | Returns all groups. |
| `POST` | `/groups` | CreateGroupModal | Creates a group. |
| `GET` | `/members` | MemberHistory, GroupMembersHistory, AssignMemberModal, Auction | Returns global members. |
| `POST` | `/members` | AddMemberModal | Creates a member. |
| `GET` | `/group-members/:groupId` | GroupMembersHistory, Auction | Returns members assigned to group. |
| `POST` | `/group-members` | AssignMemberModal | Assigns a member to a group. |
| `GET` | `/ledger/full?groupId=...` | Ledger | Returns ledger matrix. |
| `GET` | `/ledger/export/csv?groupId=...` | LedgerExport | Returns CSV blob. |
| `POST` | `/payments` | PaymentModal, PaymentRow | Records payment. |
| `GET` | `/dashboard?groupId=...` | Dashboard | Returns metric summary. |
| `GET` | `/dashboard/chart?groupId=...` | Dashboard | Returns chart data. |
| `GET` | `/auction/:groupId` | Auction | Returns auction history. |
| `POST` | `/auction` | Auction | Records auction. Uses query params. |

## 11. Async State Rules

Use explicit state:

```js
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [data, setData] = useState(...);
```

Render pattern:

```jsx
{!groupId && <StatePanel title="No group selected" />}
{groupId && loading && <Skeletons />}
{groupId && !loading && error && <StatePanel title="Unable to load" />}
{groupId && !loading && !error && data.length === 0 && <StatePanel title="Empty" />}
{groupId && !loading && !error && data.length > 0 && <DataView />}
```

For initial `useEffect` fetches, current code uses promise callbacks and an `active` guard:

```js
useEffect(() => {
  let active = true;

  api.get("/endpoint")
    .then((res) => {
      if (!active) return;
      setData(res.data);
    })
    .finally(() => {
      if (active) setLoading(false);
    });

  return () => {
    active = false;
  };
}, []);
```

This avoids stale state updates after unmounts.

## 12. Known Caveats and Follow-ups

- Backend must be running at `http://localhost:8080/api`; otherwise the app shows retryable error states.
- `AppProvider` in `src/context/AppContext.jsx` exists but most current data comes from API calls, not context.
- `useGroup()` stores the latest group ID in localStorage. This is useful for bottom nav links, but group pages should still fetch from URL params.
- Package files currently include `react-hot-toast`, and `App.jsx` renders `Toaster`.
- Vite build may warn about chunks larger than 500 kB because charts and app code are bundled together. Build still succeeds.
- The README is still the Vite template. This handoff doc is the real project documentation unless README is later updated to point here.
- Dashboard redesign/backend requirements are documented in `docs/DASHBOARD_BACKEND_REQUIREMENTS.md`.

## 13. Verification Checklist

Before handing off changes, run:

```bash
npm run lint
npm run build
```

Expected status after the latest UI/state refactor:

- `npm run lint` passes.
- `npm run build` passes.
- Build may print a non-failing chunk-size warning.

## 14. Suggested Future Improvements

- Update `README.md` to link to this file and include setup instructions.
- Move API endpoint names into a small service layer if the backend contract grows.
- Add form validation beyond alerts.
- Replace browser `alert()` calls with toast notifications everywhere.
- Add route guards or a clearer selected-group flow for bottom nav when no group exists.
- Consider code-splitting Recharts pages if bundle size matters.
- Add tests for loading/error/empty/data rendering on each page.
