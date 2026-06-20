# Security Implementation

This backend now uses stateless bearer-token authentication for `/api/**`.

## Login

Endpoint:

```http
POST /api/auth/login
```

Request:

```json
{
  "username": "admin",
  "password": "ChangeMe_Admin_2026!"
}
```

Response:

```json
{
  "token": "...",
  "username": "admin",
  "role": "ADMIN"
}
```

Send authenticated API requests with:

```http
Authorization: Bearer {token}
```

## Configured Users

Default development users are configured through properties:

```properties
app.security.admin-username=admin
app.security.admin-password=ChangeMe_Admin_2026!
app.security.user-username=user
app.security.user-password=ChangeMe_User_2026!
app.security.token-ttl-minutes=480
```

For production, override all passwords using environment-specific configuration or a secret manager. Passwords must be at least 12 characters and include uppercase, lowercase, number, and symbol.

## Roles

- `ADMIN`: can create payments, auctions, groups, members, member assignments, export ledger CSV, soft-delete mutable records, and view audit logs.
- `USER`: can read dashboard, ledger, members, groups, group members, auctions, and payments.

## Rate Limiting

`POST /api/auth/login` is rate-limited by remote address and username:

```txt
5 attempts per 1 minute
```

## Audit Logs

The backend writes audit rows for:

- Payment creation
- Auction creation
- Group creation
- Member creation
- Member assignment
- Group soft delete
- Member soft delete
- Member unassignment

Audit logs are available to admins at:

```http
GET /api/audit-logs
```

## Soft Delete and Immutable Payments

Mutable records use soft delete where endpoints exist:

- `DELETE /api/groups/{id}`
- `DELETE /api/members/{id}`
- `DELETE /api/group-members/{id}`

Payments are intentionally immutable. There is no update or delete endpoint for payment history. Duplicate group/member/month payments are rejected.

## Production Notes

- Use HTTPS at the edge or reverse proxy.
- Keep PostgreSQL private and never expose it directly to the internet.
- Enable managed PostgreSQL encryption at rest and automated daily backups.
- Replace default development credentials before deployment.
