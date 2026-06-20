# ChitFund User Onboarding Guide

Beginner-friendly guide for using the ChitFund application.

## 1. What This Application Does

ChitFund helps you manage chit fund operations in one place.

You can use it to:

- Create chit groups.
- Add members.
- Assign members to groups.
- Track monthly payments.
- Record auction winners.
- View group progress on the dashboard.
- Export ledger reports.
- Manage users and roles.
- Review audit logs of important activity.

The application is designed for daily operational use by owners, managers, collectors, accountants, and viewers.

## 2. Basic Words Used in the App

| Word | Meaning |
| --- | --- |
| Group | A chit fund group with amount, monthly premium, members, and duration. |
| Member | A person who participates in chit groups. |
| Group Member | A saved member assigned to a specific chit group. |
| Ledger | The month-by-month payment table for a group. |
| Payment | A monthly amount paid by a member. |
| Auction | The monthly selection of a winning member and bid details. |
| Dashboard | A summary screen showing collections, pending dues, auction status, and health. |
| Export | Downloading data as Excel or CSV. |
| Audit Log | A record of important actions performed in the system. |
| Role | The type of access a user has. |

## 3. User Roles

Every user has a role. The role controls which screens and actions are visible.

The backend is the final security authority. The frontend hides unavailable actions to make the app easier to use.

| Role | What They Can Usually Do |
| --- | --- |
| OWNER | Full access. Can manage users, view audit logs, manage groups, members, payments, auctions, and exports. |
| MANAGER | Can manage day-to-day operations like groups, members, payments, auctions, reports, exports, and audit logs. |
| COLLECTOR | Can view members and payments, and record payments. Cannot manage users, audit logs, or exports. |
| ACCOUNTANT | Can view reports, export reports, and view audit logs. Cannot manage auctions. |
| VIEWER | Read-only access to operational screens. Cannot create, edit, delete, record payments, or export. |

If you do not see a button or menu item, your role may not have permission for it.

## 4. Logging In

1. Open the ChitFund application.
2. You will be taken to the login page if you are not already signed in.
3. Enter your username and password.
4. Click the login button.
5. After login, you will see the main application screens based on your role.

If login fails:

- Check that the username and password are correct.
- Ask the owner to confirm that your user account is active.
- If your session expires, log in again.

## 5. Understanding the Main Navigation

The bottom navigation shows the screens you can access.

Common navigation items:

- Groups
- Ledger
- Dashboard
- Members
- Auction
- Audit
- Users

Some items appear only for certain roles. For example:

- Only owners see user management.
- Collectors do not see audit logs or exports.
- Accountants do not see auction management.

## 6. First-Time Setup Flow

If you are setting up the app from the beginning, follow this order:

1. Log in as an owner.
2. Create users for your team.
3. Create a chit group.
4. Add members to the member directory.
5. Assign members to the group.
6. Use the dashboard to review the group.
7. Record monthly payments in the ledger.
8. Record auctions when they happen.
9. Export reports when needed.
10. Review audit logs for important activity.

## 7. Creating a Chit Group

Used by: Owner or Manager.

1. Open the Groups screen.
2. Click the plus button.
3. Fill in the group details:
   - Group Name
   - Total Amount
   - Monthly Premium
   - Number of Members
   - Duration
   - Payment Start Month
4. Click Create Group.
5. The group will appear in the group list.

Tips:

- Use a clear group name, such as `Sankranti Chitti 2026`.
- Make sure duration and member count match your actual chit plan.
- After creating a group, assign members before using the ledger fully.

## 8. Opening a Group

1. Go to the Groups screen.
2. Tap a group card.
3. The app opens the selected group area.
4. You can then use group-specific screens:
   - Members
   - Ledger
   - Dashboard
   - Auction

The app remembers the most recently opened group for bottom navigation.

## 9. Adding Members

Used by: Owner or Manager.

1. Open the Members screen.
2. Click the plus button.
3. Enter the member name.
4. Enter the phone number if available.
5. Click Add Member.

This creates a member in the shared member directory. A member in the directory is not automatically part of every group.

## 10. Assigning Members to a Group

Used by: Owner or Manager.

1. Open a group.
2. Go to the group Members screen.
3. Click the plus button.
4. Choose saved members from the list.
5. Add the required members to the group.

After assignment:

- Members appear in the group member list.
- The ledger can show payment rows for those members.
- Auctions can use eligible group members.

## 11. Using the Ledger

The Ledger is the payment tracking screen for a selected group.

1. Open a group.
2. Go to Ledger.
3. You will see a payment matrix:
   - Rows are members.
   - Columns are months.
   - Paid cells show `Paid`.
   - Unpaid cells show `-`.

### Recording a Payment

Used by: Owner, Manager, or Collector.

1. In the Ledger screen, find the member row.
2. Find the unpaid month column.
3. Tap the unpaid cell.
4. Enter payment details in the payment modal.
5. Save the payment.
6. The cell becomes paid after the ledger refreshes.

Notes:

- Paid cells cannot be clicked again.
- Payments are controlled by backend rules, so duplicate payments may be rejected.
- If you cannot click unpaid cells, your role may not allow payment recording.

## 12. Exporting Ledger Reports

Used by: Owner, Manager, or Accountant.

1. Open a group.
2. Go to Ledger.
3. Click Excel or CSV in the ledger header.

Excel export is best for accounting and review. It includes multiple sheets:

- Summary
- Member Ledger
- Payment Matrix
- Transaction History
- Monthly Collection

CSV export is lighter and useful for quick sharing.

If export buttons are not visible, your role may not have export permission.

## 13. Using the Dashboard

The Dashboard gives a quick operational summary for a selected group.

Open a group, then go to Dashboard.

You can review:

- Current month status.
- Collection progress.
- Total collected amount.
- Total profit.
- Member count.
- Group health.
- Pending payments.
- Overdue members.
- Auction status.
- Quick action shortcuts.

Some dashboard widgets are hidden if your role does not have permission for that area.

## 14. Recording an Auction

Used by: Owner or Manager.

1. Open a group.
2. Go to Auction.
3. Enter the auction month.
4. Select the winning member.
5. Enter the bid amount.
6. Click Confirm Auction.

After saving:

- The auction appears in Auction History.
- Dashboard auction metrics update after refresh.
- The backend records the event for audit history.

If you can see auction history but not the record form, your role likely has view permission but not management permission.

## 15. Managing Users

Used by: Owner only.

Route:

```txt
/settings/users
```

The Users screen helps owners manage who can access the application.

You can:

- View all users.
- Search users.
- Filter by role.
- Create a user.
- Edit a user's role.
- Activate or deactivate a user.
- Move through pages of users.

### Creating a User

1. Go to Users.
2. Click Create.
3. Enter name, email, password, and role.
4. Click Create User.

### Editing a User

1. Go to Users.
2. Find the user in the table.
3. Click the edit button.
4. Change the role.
5. Save changes.

### Deactivating a User

1. Go to Users.
2. Find the user.
3. Click the status toggle.
4. The user becomes inactive.

Inactive users should not be able to continue using the application.

## 16. Viewing Audit Logs

Used by: Owner, Manager, or Accountant.

Route:

```txt
/settings/audit-logs
```

Audit logs show important actions in the system.

You can filter by:

- Search text.
- User.
- Date range.
- Entity type.
- Action type.

Audit table columns include:

- Timestamp
- User
- Role
- Action
- Entity Type
- Entity ID
- IP Address

Click a row to open the details drawer.

The details drawer shows:

- Before changes.
- After changes.
- Added fields.
- Updated fields.
- Removed fields.
- User agent, when available.

Audit logs are read-only. They cannot be edited or deleted from the frontend.

## 17. Exporting Audit Logs

Used by: Owner, Manager, or Accountant.

1. Go to Audit Logs.
2. Apply any filters you need.
3. Click Export Excel.
4. The exported file includes the active filters.

Use this for compliance review, investigation, or operational reporting.

## 18. Common Daily Workflows

### Daily Collection Workflow

Best for: Collector or Manager.

1. Log in.
2. Open the correct group.
3. Go to Dashboard.
4. Check pending members.
5. Go to Ledger.
6. Record payments for collected members.
7. Return to Dashboard to confirm progress.

### Month-End Accounting Workflow

Best for: Accountant or Owner.

1. Open the group.
2. Review Dashboard totals.
3. Open Ledger.
4. Export the Excel ledger.
5. Review pending and overdue members.
6. Open Audit Logs if activity verification is needed.
7. Export audit logs if required.

### New Group Setup Workflow

Best for: Owner or Manager.

1. Create the group.
2. Add members to the member directory.
3. Assign members to the group.
4. Open Dashboard to confirm member count.
5. Start recording payments from the first month.

### Auction Workflow

Best for: Owner or Manager.

1. Open the group.
2. Review payment status in Ledger.
3. Go to Auction.
4. Select eligible winner.
5. Enter bid amount.
6. Confirm auction.
7. Review Auction History and Dashboard.

## 19. Troubleshooting

### I cannot see a menu item

Your role may not have permission for that feature. Ask the owner to check your role.

### I cannot create a group or member

You may have view-only access. Creation actions require management permissions.

### I cannot record a payment

Payment recording requires payment create permission. Also, already-paid cells cannot be edited from the ledger.

### I cannot export reports

Exports require report export permission. Collectors and viewers usually cannot export.

### I see "Access denied"

You opened a route that your role cannot access. Return to an allowed screen or ask the owner for access.

### Data did not update immediately

Try refreshing the page or using the Retry button if the app shows an error state.

### My login stopped working

Your session may have expired, your token may be invalid, or your account may have been deactivated. Log in again or contact the owner.

## 20. Best Practices

- Create users with the minimum role they need.
- Keep member names and phone numbers accurate.
- Assign members to the correct group before recording payments.
- Review the dashboard before and after major updates.
- Export Excel reports for accounting records.
- Review audit logs for sensitive operations.
- Deactivate users who should no longer access the system.
- Do not share passwords.

## 21. Quick Reference

| Task | Screen | Permission Usually Needed |
| --- | --- | --- |
| Create group | Groups | Group management |
| Add member | Members | Member management |
| Assign member to group | Group Members | Member management |
| Record payment | Ledger | Payment create |
| Export ledger | Ledger | Report export |
| View dashboard | Dashboard | Dashboard view |
| Record auction | Auction | Auction management |
| Manage users | Users | User management |
| View audit logs | Audit Logs | Audit view |
| Export audit logs | Audit Logs | Audit view |

## 22. Who To Contact

If you are unsure what to do:

1. Ask your manager or application owner.
2. Share the screen name and what you were trying to do.
3. Mention any error message you saw.
4. If it is an access issue, ask the owner to review your role.

