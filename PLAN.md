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
| userId | text | notNull, references users.id (cascade delete) |
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

## Ping Detail/Chat Page (/ping/$pingId.tsx)

### Features
- Shows ping details (game, message, time, participants)
- Real-time chat using WebSocket
- **Accept/Decline buttons** for invited users
- **Leave button** for participants
- Chat messages with sender names and timestamps
- Auto-scroll to new messages

### WebSocket Messages
- `join` - Join ping room
- `leave` - Leave ping room
- `chat` - Send message
- `auth` - Authenticate user

## Implementation Status

### Completed ✓
1. Database schema with migrations
2. Server functions for CRUD operations
3. Create ping page with form
4. Ping display on home page with participant avatars
5. Ping detail/chat page with WebSocket
6. Real-time messaging in pings
7. Accept/Decline buttons for invited pings
8. Leave button for created pings

### To Do
- Persist chat messages to database
- Push notifications for invites
- Ping expiry notifications
- Recurring pings feature

## Questions for Future Implementation

- **Notifications**: In-app only initially, email/push later?
- **Ping chat**: Real-time chat or simple comment thread?
- **Recurring pings**: Daily/weekly ping templates?
- **Ping templates**: Save frequently used ping configurations?
