# Dashboard Redesign and Backend API Requirements

This document is intended for the backend agent. The current frontend dashboard is too generic and does not help the admin understand what needs attention. The new dashboard should become a useful group control center.

## 1. Dashboard Product Goal

The dashboard should answer these questions for a selected chit group:

- How much money should be collected this month?
- How much has already been collected?
- Who has not paid?
- Are there overdue payments from previous months?
- What is the current auction status?
- Who won the last auction?
- How much profit has the group generated?
- Is the group healthy or risky?
- What should the admin do next?

The frontend should not need to combine ledger, auction, group, and member APIs manually for dashboard rendering. The backend should provide dashboard-focused APIs.

## 2. UI Changes Planned

The frontend dashboard will be redesigned around these sections.

### 2.1 Top Monthly Summary

Replace the current plain metric grid with a monthly progress section.

Show:

- Current month number.
- Duration progress, for example `Month 4 of 20`.
- Expected collection for the current month.
- Collected amount for the current month.
- Pending amount for the current month.
- Collection percentage.
- Progress bar.

Example:

```txt
Month 4 of 20
₹1,20,000 collected / ₹1,50,000 expected
80% complete
```

### 2.2 Needs Attention Section

Show action-focused warnings near the top.

Examples:

- `5 members pending payment`
- `Auction for Month 4 not completed`
- `2 members have missed previous months`
- `Only 18 of 20 members assigned`

This section should help the admin quickly decide what to do next.

### 2.3 Pending Members List

Instead of only returning a count, return the actual pending members.

Frontend should display:

```txt
Pending This Month
- Ramesh    ₹5,000
- Suresh    ₹5,000
- Kiran     ₹5,000
```

Each pending member should include enough data for future actions such as "Collect Payment" or "Call Member".

### 2.4 Auction Snapshot

Show both last auction and current/next auction status.

Example:

```txt
Last Auction
Winner: Suresh
Month: 3
Bid: ₹20,000
Profit: ₹20,000

Next Auction
Month: 4
Status: Pending
Eligible Members: 17
```

### 2.5 Group Health

Return a simple health status and score.

Possible statuses:

- `GOOD`
- `NEEDS_ATTENTION`
- `RISKY`

The frontend will render this as a health card with reasons.

Example:

```txt
Group Health: Good
Collection rate: 80%
Member fill: 20/20
Overdue members: 2
```

### 2.6 Better Charts

The dashboard should have meaningful charts, not just generic totals.

Recommended charts:

- Collection trend by month.
- Pending amount trend by month.
- Profit trend by auction month.

Two charts are enough for the first version:

- Collection trend.
- Profit trend.

### 2.7 Recent Activity

Optional but useful.

Examples:

```txt
Today
- Ramesh paid ₹5,000 by UPI
- Auction Month 3 completed
- Kiran added to group
```

This can be implemented as a separate optional endpoint.

## 3. Required Backend APIs

### 3.1 Dashboard Summary

Endpoint:

```http
GET /api/dashboard/summary?groupId={groupId}
```

Purpose:

Return everything the frontend needs for the primary dashboard cards, monthly progress, pending members, auction snapshot, profit summary, and health status.

Response shape:

```json
{
  "group": {
    "id": 1,
    "name": "Sankranti Chitti",
    "totalAmount": 1000000,
    "monthlyPremium": 50000,
    "totalMembers": 20,
    "assignedMembers": 18,
    "duration": 20,
    "currentMonth": 4,
    "startMonth": "2026-01-01"
  },
  "collection": {
    "expectedThisMonth": 900000,
    "collectedThisMonth": 720000,
    "pendingThisMonth": 180000,
    "collectionRate": 80,
    "totalCollectedTillNow": 2800000
  },
  "payments": {
    "pendingMembers": [
      {
        "memberId": 3,
        "name": "Ramesh",
        "phone": "9876543210",
        "amountDue": 50000,
        "month": 4
      }
    ],
    "overdueMembers": [
      {
        "memberId": 7,
        "name": "Kiran",
        "phone": "9876543211",
        "missedMonths": [2, 3],
        "amountDue": 100000
      }
    ]
  },
  "auction": {
    "currentMonthAuctionStatus": "PENDING",
    "lastAuction": {
      "id": 12,
      "month": 3,
      "winnerMemberId": 5,
      "winnerName": "Suresh",
      "bidAmount": 20000,
      "payoutAmount": 980000,
      "profit": 20000
    },
    "nextAuction": {
      "month": 4,
      "eligibleMembers": 17
    }
  },
  "profit": {
    "totalProfit": 60000,
    "averageProfitPerAuction": 20000
  },
  "health": {
    "status": "GOOD",
    "score": 82,
    "reasons": [
      "80% collection completed this month",
      "2 overdue members",
      "Auction pending for current month"
    ]
  }
}
```

### 3.2 Dashboard Trends

Endpoint:

```http
GET /api/dashboard/trends?groupId={groupId}
```

Purpose:

Return chart-ready data by month.

Response shape:

```json
{
  "collectionTrend": [
    {
      "month": 1,
      "expected": 900000,
      "collected": 900000,
      "pending": 0
    },
    {
      "month": 2,
      "expected": 900000,
      "collected": 850000,
      "pending": 50000
    }
  ],
  "profitTrend": [
    {
      "month": 1,
      "profit": 15000
    },
    {
      "month": 2,
      "profit": 22000
    }
  ]
}
```

### 3.3 Optional Dashboard Activity

Endpoint:

```http
GET /api/dashboard/activity?groupId={groupId}
```

Purpose:

Return recent actions/events for the selected group.

Response shape:

```json
[
  {
    "id": 1,
    "type": "PAYMENT",
    "message": "Ramesh paid ₹50,000 by UPI",
    "createdAt": "2026-05-30T10:30:00"
  },
  {
    "id": 2,
    "type": "AUCTION",
    "message": "Month 3 auction completed. Winner: Suresh",
    "createdAt": "2026-05-29T18:00:00"
  }
]
```

Suggested activity types:

- `PAYMENT`
- `AUCTION`
- `MEMBER_ASSIGNED`
- `MEMBER_CREATED`
- `GROUP_CREATED`
- `GROUP_UPDATED`

## 4. Backend Calculation Rules

### 4.1 `currentMonth`

Calculate `currentMonth` from group `startMonth`.

Suggested rule:

- Month 1 starts at `startMonth`.
- Increment by calendar month.
- Clamp to the range `1..duration`.

If backend already has a current month concept, return that consistently.

### 4.2 Expected Collection

For the current month:

```txt
expectedThisMonth = assignedMembers * monthlyPremium
```

If business rules require totalMembers instead of assignedMembers, document that and return both counts.

### 4.3 Collected Collection

For the current group and current month:

```txt
collectedThisMonth = sum(payments.amount where groupId and month = currentMonth)
```

### 4.4 Pending Collection

```txt
pendingThisMonth = expectedThisMonth - collectedThisMonth
```

Never return a negative pending amount. Use `0` minimum.

### 4.5 Collection Rate

```txt
collectionRate = round((collectedThisMonth / expectedThisMonth) * 100)
```

If expected is `0`, return `0`.

### 4.6 Pending Members

Return members assigned to the group who do not have a paid payment record for the current month.

Each pending member should include:

- `memberId`
- `name`
- `phone`
- `amountDue`
- `month`

### 4.7 Overdue Members

Return members who missed one or more months before the current month.

Each overdue member should include:

- `memberId`
- `name`
- `phone`
- `missedMonths`
- `amountDue`

### 4.8 Auction Status

For `currentMonthAuctionStatus`, recommended values:

- `PENDING`
- `COMPLETED`
- `NOT_STARTED`

If an auction row exists for current month, return `COMPLETED`; otherwise return `PENDING`.

### 4.9 Eligible Members

For `nextAuction.eligibleMembers`, return the count of assigned members who have not already won an auction in the group.

### 4.10 Health Score

Backend can start simple.

Suggested scoring:

```txt
score = 100
- 25 if collectionRate < 60
- 15 if collectionRate is 60..79
- 20 if overdueMembers.length > 0
- 10 if current month auction is pending
- 10 if assignedMembers < totalMembers
```

Suggested status:

```txt
GOOD: score >= 80
NEEDS_ATTENTION: score >= 50 and score < 80
RISKY: score < 50
```

Return `reasons` explaining the score.

## 5. Backend Agent Task Prompt

Use this prompt for the backend agent:

```txt
Create improved dashboard APIs for the chit fund frontend.

Required endpoints:

1. GET /api/dashboard/summary?groupId={groupId}
Return group details, current month collection status, pending members, overdue members, auction summary, profit summary, and group health.

2. GET /api/dashboard/trends?groupId={groupId}
Return collection trend and profit trend arrays by month.

3. Optional: GET /api/dashboard/activity?groupId={groupId}
Return recent group activity such as payments, auctions, member assignment, and group changes.

Important rules:
- All APIs must be calculated based on groupId.
- Empty data should return empty arrays, not errors.
- Numeric money fields should be numbers, not formatted strings.
- Include member names and phone numbers in pending/overdue lists so frontend does not need to join manually.
- currentMonth should be calculated from group startMonth and duration.
- Dashboard summary should include enough data for frontend to render without calling ledger, auction, members, and groups separately.
- Return clear 404 or 400 errors only for invalid groupId; do not error for normal empty states.
```

## 6. Frontend Work After Backend Is Ready

Once these APIs exist, update `src/pages/Dashboard.jsx` to:

- Replace current `/dashboard` and `/dashboard/chart` calls.
- Fetch `/dashboard/summary` and `/dashboard/trends`.
- Render monthly progress at the top.
- Render needs-attention items.
- Render pending and overdue member lists.
- Render auction snapshot.
- Render group health.
- Render collection/profit trend charts.
- Optionally fetch and render activity feed.

The final dashboard should be action-focused, not just a list of numbers.
