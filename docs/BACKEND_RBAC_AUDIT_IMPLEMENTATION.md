# Backend RBAC and Audit Implementation

This document explains the backend design, implementation principles, security model, audit trail, API endpoints, and operational notes for the ChitFund Spring Boot backend.

## 1. Backend Stack

- Java 21
- Spring Boot 3.x
- Spring Security with method security
- Signed bearer token authentication
- JPA/Hibernate
- PostgreSQL
- Flyway
- Maven

Core backend modules:

- Authentication
- Users and RBAC
- Groups
- Members
- Group Members
- Payments
- Auctions
- Ledger and exports
- Dashboard
- Audit trail

## 2. Design Principles

### Backend Is the Source of Truth

Authorization is enforced in the backend. Frontend role checks may improve UX, but they must never be treated as security.

All protected controller methods use `@PreAuthorize` with `PermissionService`.

### Centralized Authorization

Controllers do not hardcode role names such as `OWNER` or `MANAGER`.

Authorization flows through:

- `Role`
- `Permission`
- `PermissionService`

This keeps role-to-permission mapping in one place and makes future role changes safer.

### Immutable Audit Trail

Audit logs are append-only.

The backend does not expose update or delete endpoints for audit logs. The `AuditLog` entity also blocks JPA update/delete lifecycle events.

### Audit Outside Controllers

Controllers do not write audit records.

Domain changes are audited with:

- `@Auditable`
- `AuditAspect`
- `AuditService`

This keeps controllers thin and avoids missing audit records when service methods are reused.

### Soft Delete for User Management

Users are not physically deleted from the database. `DELETE /api/users/{id}` deactivates the user.

The same style is preserved for existing soft-delete domain flows such as groups, members, and group-member assignments.

### Backward-Compatible Bootstrap

The app still reads configured development users from `application.properties`, but those users are now synchronized into the `users` table on startup.

The old admin-style configured user maps to `OWNER`.
The old user-style configured user maps to `VIEWER`.

## 3. Role Model

Roles:

- `OWNER`
- `MANAGER`
- `COLLECTOR`
- `ACCOUNTANT`
- `VIEWER`

### Permission Matrix

| Role | Permissions |
| --- | --- |
| `OWNER` | Full access |
| `MANAGER` | Dashboard, groups, members, payments, auctions, audit logs, reports, exports |
| `COLLECTOR` | Dashboard, view members, view payments, record payments |
| `ACCOUNTANT` | Dashboard, reports, exports, audit logs |
| `VIEWER` | Read-only dashboard, groups, members, payments, auctions, reports |

Implemented permission enum values:

- `VIEW_DASHBOARD`
- `MANAGE_GROUPS`
- `VIEW_GROUPS`
- `MANAGE_MEMBERS`
- `VIEW_MEMBERS`
- `RECORD_PAYMENTS`
- `VIEW_PAYMENTS`
- `MANAGE_AUCTIONS`
- `VIEW_AUCTIONS`
- `VIEW_REPORTS`
- `EXPORT_REPORTS`
- `VIEW_AUDIT_LOGS`
- `MANAGE_USERS`

## 4. Authentication

### Login

```http
POST /api/auth/login
```

Request:

```json
{
  "username": "admin",
  "password": "Kanaka#7137900"
}
```

Response:

```json
{
  "token": "signed.jwt.token",
  "username": "admin",
  "role": "OWNER"
}
```

The token includes claims similar to:

```json
{
  "sub": "admin",
  "uid": "user-uuid",
  "role": "OWNER",
  "exp": 1781930000
}
```

Use the token with:

```http
Authorization: Bearer {token}
```

### Logout

```http
POST /api/auth/logout
```

Headers:

```http
Authorization: Bearer {token}
```

Response:

```json
{
  "message": "Logged out"
}
```

Logout records an audit event and revokes the current token in the app's in-memory token session layer.

## 5. User Management API

Only `OWNER` can manage users.

### List Users

```http
GET /api/users
```

Required permission:

- `MANAGE_USERS`

### Get User

```http
GET /api/users/{id}
```

### Create User

```http
POST /api/users
```

Request:

```json
{
  "username": "manager@example.com",
  "password": "StrongPass#2026",
  "role": "MANAGER"
}
```

### Update User Role

```http
PUT /api/users/{id}
```

Request:

```json
{
  "role": "ACCOUNTANT"
}
```

### Update User Status

```http
PATCH /api/users/{id}/status
```

Request:

```json
{
  "active": false
}
```

### Soft Delete User

```http
DELETE /api/users/{id}
```

This deactivates the user instead of deleting the row.

## 6. Audit Trail

### Audit Actions

Supported actions:

- `CREATE`
- `UPDATE`
- `DELETE`
- `LOGIN`
- `LOGOUT`
- `EXPORT`

### Audit Data Captured

Each audit log stores:

- Entity type
- Entity ID
- Action
- Old values as JSONB
- New values as JSONB
- User ID
- Username
- User role
- IP address
- User agent
- Created timestamp

### Audited Events

Audited flows include:

- Login
- Logout
- Group create and soft delete
- Member create and soft delete
- Group-member assignment and unassignment
- Payment creation
- Auction creation
- User create/update/status/delete
- Ledger CSV export

Payments remain immutable in the existing business model. Duplicate payments for the same group/member/month are rejected.

## 7. Audit API

Audit logs are readable by:

- `OWNER`
- `MANAGER`
- `ACCOUNTANT`

### Search Audit Logs

```http
GET /api/audit-logs
```

Supported filters:

- `entityType`
- `entityId`
- `action`
- `performedBy`
- `startDate`
- `endDate`
- pagination parameters such as `page` and `size`
- sorting parameters such as `sort=createdAt,desc`

Example:

```http
GET /api/audit-logs?entityType=Payment&action=CREATE&page=0&size=20&sort=createdAt,desc
```

### Get Audit Log by ID

```http
GET /api/audit-logs/{id}
```

There are intentionally no audit update or delete endpoints.

## 8. Existing Business API Security

### Dashboard

```http
GET /api/dashboard?groupId={groupId}
GET /api/dashboard/summary?groupId={groupId}
GET /api/dashboard/chart?groupId={groupId}
GET /api/dashboard/trends?groupId={groupId}
```

Required permission:

- `VIEW_DASHBOARD`

### Groups

```http
GET /api/groups
POST /api/groups
DELETE /api/groups/{id}
```

Permissions:

- `GET`: `VIEW_GROUPS`
- `POST`, `DELETE`: `MANAGE_GROUPS`

### Members

```http
GET /api/members
POST /api/members
DELETE /api/members/{id}
```

Permissions:

- `GET`: `VIEW_MEMBERS`
- `POST`, `DELETE`: `MANAGE_MEMBERS`

### Group Members

```http
GET /api/group-members/{groupId}
POST /api/group-members
DELETE /api/group-members/{id}
```

Permissions:

- `GET`: `VIEW_MEMBERS`
- `POST`, `DELETE`: `MANAGE_MEMBERS`

### Payments

```http
GET /api/payments?groupId={groupId}&month={yyyy-mm-dd}
POST /api/payments
```

Permissions:

- `GET`: `VIEW_PAYMENTS`
- `POST`: `RECORD_PAYMENTS`

### Auctions

```http
GET /api/auction/{groupId}
POST /api/auction?groupId={groupId}&month={month}&winnerId={memberId}&bidAmount={amount}
```

Permissions:

- `GET`: `VIEW_AUCTIONS`
- `POST`: `MANAGE_AUCTIONS`

### Ledger and Export

```http
GET /api/ledger/full?groupId={groupId}
GET /api/ledger/export/csv?groupId={groupId}
```

Permissions:

- `GET /full`: `VIEW_REPORTS`
- `GET /export/csv`: `EXPORT_REPORTS`

## 9. Database Changes

Flyway migration:

```txt
src/main/resources/db/migration/V1__rbac_and_audit.sql
```

### Users Table

Table:

```sql
users
```

Important columns:

- `id UUID PRIMARY KEY`
- `username VARCHAR(255) UNIQUE`
- `password_hash VARCHAR(255)`
- `role VARCHAR(50) NOT NULL DEFAULT 'VIEWER'`
- `active BOOLEAN NOT NULL DEFAULT TRUE`
- `last_login TIMESTAMP`
- `created_at TIMESTAMP`
- `updated_at TIMESTAMP`
- `created_by UUID`
- `updated_by UUID`

### Audit Logs Table

Table:

```sql
audit_logs
```

Columns:

- `id UUID PRIMARY KEY`
- `entity_type VARCHAR(100)`
- `entity_id VARCHAR(100)`
- `action VARCHAR(50)`
- `old_values JSONB`
- `new_values JSONB`
- `performed_by UUID`
- `performed_by_name VARCHAR(255)`
- `performed_by_role VARCHAR(50)`
- `ip_address VARCHAR(100)`
- `user_agent TEXT`
- `created_at TIMESTAMP NOT NULL`

Indexes:

- `entity_type`
- `entity_id`
- `performed_by`
- `created_at`

## 10. Important Classes

Security:

- `com.chitfund.entity.Role`
- `com.chitfund.security.Permission`
- `com.chitfund.security.PermissionService`
- `com.chitfund.security.JwtService`
- `com.chitfund.security.TokenAuthenticationFilter`
- `com.chitfund.security.AuthenticatedUser`

Users:

- `com.chitfund.entity.AppUserEntity`
- `com.chitfund.repository.AppUserRepository`
- `com.chitfund.service.UserService`
- `com.chitfund.controller.UserController`
- `com.chitfund.dto.user.*`

Audit:

- `com.chitfund.entity.AuditAction`
- `com.chitfund.entity.AuditLog`
- `com.chitfund.repository.AuditLogRepository`
- `com.chitfund.audit.Auditable`
- `com.chitfund.audit.AuditAspect`
- `com.chitfund.service.AuditService`
- `com.chitfund.controller.AuditLogController`

## 11. Configuration

Relevant properties:

```properties
app.security.admin-username=admin
app.security.admin-password=Kanaka#7137900
app.security.user-username=user
app.security.user-password=User#9000242704
app.security.token-ttl-minutes=480
app.security.jwt-secret=ChangeMe_JwtSecret_AtLeast32Chars_2026
```

Flyway is configured to support adoption on an existing non-empty schema:

```properties
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=0
```

Production should override all secrets and passwords outside source control.

## 12. Testing

Run:

```bash
./mvnw test
```

Current focused coverage includes:

- JWT role extraction and tamper rejection
- Permission matrix checks
- Controller security annotations use `PermissionService`
- Audit record metadata creation
- Audit immutability guard
- Application context startup with Flyway

Last verified result:

```txt
Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

## 13. Production Notes

- Use HTTPS in front of the API.
- Store `app.security.jwt-secret` in an environment secret manager.
- Replace development bootstrap credentials.
- Keep PostgreSQL private.
- Keep Flyway as the source of database schema changes going forward.
- Consider moving revoked tokens/session state to Redis if multiple backend instances are deployed.
- Consider database-level protection for audit immutability if stronger compliance guarantees are needed.

