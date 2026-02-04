# Create Ping Feature Plan

## Overview
Allow users to create "pings" - invitations to hang out with friends for gaming or other activities. Pings expire after 1 hour of inactivity.

## Database Schema

### pings table
| Column | Type | Constraints |
|--------|------|-------------|
| id | text | primary key |
| creatorId | text | notNull, references users.id |
| message | text | optional |
| game | text | optional |
| scheduledAt | timestamp | optional |
| scheduledEndAt | timestamp | optional |
| status | enum | pending/active/completed/expired, default: pending |
| lastActivityAt | timestamp | notNull, defaultNow |
| expiresAt | timestamp | notNull (calculated: lastActivityAt + 1 hour) |
| createdAt | timestamp | notNull, defaultNow |

### ping_invites table
| Column | Type | Constraints |
|--------|------|-------------|
| id | text | primary key |
| pingId | text | notNull, references pings.id (cascade delete) |
| userId | text | notNull, references users.id |
| status | enum | pending/accepted/declined, default: pending |
| respondedAt | timestamp | |

### Enums
- `ping_status`: pending, active, completed, expired
- `invite_status`: pending, accepted, declined

## Create Ping Page (/ping/create.tsx)

### Form Fields

#### 1. Game Selector - Combobox with search
- Options: League of Legends, Valorant, Counter-Strike 2, Minecraft, Fortnite, Apex Legends, Call of Duty, Rocket League, Overwatch 2, Dota 2, Among Us, Fall Guys, Other (custom)
- "Other" reveals text input for custom game name

#### 2. Message - Optional textarea
- Placeholder: "What's the plan? (optional)"
- Max 500 characters

#### 3. Friends - Multi-select horizontal scroll
- Friend cards with avatar + name + checkbox
- Must select at least 1 friend
- Shows selected count
- "Select All" toggle for convenience

#### 4. Time - Tab toggle [Single] [Range]
- Single: One datetime-local input + "Now" button (sets to current time)
- Range: Two datetime-local inputs (Start → End)
- Optional: Can leave empty for immediate/ongoing pings

#### 5. Submit - "Send Ping" button
- Disabled until at least 1 friend selected
- Shows loading state during submission

## Server Functions (src/lib/server/pings.ts)

- `createPing(data)` - Creates ping record + invite records for each selected friend, calculates expiresAt
- `getActivePings()` - Returns non-expired pings where user is creator or invitee
- `respondToPingInvite(pingId, action)` - Accept/decline invite, updates status
- `updatePingActivity(pingId)` - Updates lastActivityAt, recalculates expiresAt (+1 hour)
- `expireOldPings()` - Background task to mark expired pings

## UI Components Needed

1. **GameCombobox** - Searchable dropdown with game list + custom input
2. **FriendMultiSelect** - Horizontal scrollable friend cards with selection
3. **DateTimePicker** - Styled wrapper around native datetime-local input
4. **TimeRangePicker** - Two datetime inputs with validation

## Implementation Order

1. Create database migration (pings, ping_invites tables)
2. Create server functions for ping management
3. Create ping creation page with form
4. Update home page "Current Pings" to show real data
5. Create ping detail/chat page
6. Add background expiry logic

## Questions for Future Implementation

- **Notifications**: In-app only initially, email/push later?
- **Ping chat**: Real-time chat or simple comment thread?
- **Recurring pings**: Daily/weekly ping templates?
- **Ping templates**: Save frequently used ping configurations?
