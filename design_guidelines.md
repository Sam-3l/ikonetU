# ikonetU Design Guidelines

## Design Approach
**Reference-Based Strategy**: Blend TikTok's immersive video experience + LinkedIn's professional credibility + Tinder's intuitive matching mechanics. Create a platform that feels both energizing and trustworthy for high-stakes investor connections.

## Typography System
**Primary Font**: Inter (Google Fonts) - clean, professional, excellent at small sizes
**Secondary Font**: Space Grotesk (Google Fonts) - distinctive headers, modern edge

**Hierarchy**:
- Hero Headlines: Space Grotesk, 48-64px, Bold (700)
- Section Headers: Space Grotesk, 32-40px, Semibold (600)
- Card Titles: Inter, 20-24px, Semibold (600)
- Body Text: Inter, 16px, Regular (400)
- Captions/Metadata: Inter, 14px, Medium (500)
- Buttons/CTAs: Inter, 16px, Semibold (600)

## Layout System
**Spacing Units**: Use Tailwind units of **2, 4, 8, 12, 16** (p-2, m-4, gap-8, py-12, mt-16)
- Tight spacing: 2-4 units (card internals, form fields)
- Standard spacing: 8-12 units (section padding, component gaps)
- Generous spacing: 16+ units (major section breaks)

**Grid System**:
- Mobile: Single column (max-w-md centered)
- Desktop: 2-column for profiles/forms, 3-column for feature grids
- Video Feed: Full-screen immersive (no sidebars during discovery)

## Core Components

### Navigation
**Desktop Header**: Sticky top bar with logo left, main nav center (Discover, Matches, Messages, Profile), notification bell + avatar right. Height: h-16, backdrop-blur with subtle border bottom.

**Mobile Navigation**: Bottom tab bar (5 icons: Discover, Search, Matches, Messages, Profile). Always visible, elevated above content. Height: h-16.

### Video Feed (Discovery)
**Full-Screen Vertical Layout**: Each video takes full viewport height (h-screen), swipeable. 
- Video container: Rounded corners only on mobile (rounded-3xl), edge-to-edge on fullscreen
- Overlay gradient: Dark fade from bottom (for text legibility)
- Founder info overlay (bottom-left): Avatar (w-12 h-12), name, sector tags
- Action buttons (right side): Vertical stack - Interested (heart), Maybe (bookmark), Pass (X), Info (i). Icon size: w-14 h-14, blurred background circles

### Profile Cards
**Founder Profile**: Split layout - Video preview (60% width) + Info panel (40%)
- Info panel: Avatar, name, location, 3-line bio, sector chips, stage badge
- Stats row: Views, Matches, Response Rate (subtle icons + numbers)

**Investor Profile**: Professional card layout
- Header: Avatar (w-24), name, firm, role
- Preference chips: Sectors (wrapped grid), stages, support types
- Investment thesis: 2-3 line text

### Matching Interface
**Swipe Actions**: 
- Card-based on mobile (like dating apps)
- Grid view on desktop with hover actions
- Match notification: Modal with confetti animation, "It's a Match!" headline, both profile avatars, "Start Conversation" CTA

### Messaging
**Chat Interface**: WhatsApp-style threading
- Conversation list: Avatar, name, last message preview, timestamp, unread badge
- Chat view: Bubbles with sender-specific alignment, timestamps every 5 messages
- Input: Fixed bottom bar, text field + send button, h-16

### Dashboard (Founder)
**Stats Overview**: 4-card grid (mobile: 2x2, desktop: 1x4)
- Large number + label + icon + trend indicator
- Cards: Total Views, Active Interests, Matches Made, Response Rate

**Pipeline View**: Kanban-style columns (New Interests | In Conversation | Closed)
- Investor cards: Mini avatar + name + sector + last activity timestamp
- Drag-and-drop on desktop, tap-to-move on mobile

### Admin Panel
**Dashboard**: Clean data tables with search/filter
- User management: Avatar, name, role, join date, status, actions
- Moderation queue: Video thumbnail, reporter info, reason, action buttons (Approve/Warning/Reject)

### Forms & Inputs
**Onboarding Flows**: 
- Multi-step wizard (progress dots at top)
- Large touch-friendly inputs (h-12 minimum)
- Preference chips: Toggleable, rounded-full, scale animation on select
- Video upload: Prominent camera icon button + drag-drop zone with preview

**Legal Acceptance**: Checkbox with linked modal for full terms, "I Accept" state clearly visible

## Iconography
**Icon Library**: Heroicons (outline for inactive, solid for active states)
- Consistent 24px base size
- 32px for primary actions
- 48px for empty states

## Animation Principles
**Minimal & Purposeful**:
- Video feed: Smooth snap scrolling between videos
- Match notification: Single celebration animation
- Button interactions: Subtle scale (0.95-1.0)
- NO auto-playing carousels or distracting effects

## Images
**Hero Section (Marketing Page)**: Large hero image showing diverse founders recording video pitches (authentic, energetic, professional). Full-width, h-screen on desktop, h-96 on mobile.

**Profile Avatars**: Circular, consistent sizing (w-10, w-12, w-16, w-24)

**Video Thumbnails**: 16:9 aspect ratio with play overlay icon for previews

**Empty States**: Friendly illustration placeholders for no matches/messages

## Mobile-First Priorities
- Touch targets minimum 44px (h-11, w-11)
- Bottom sheet modals for actions (vs. centered modals)
- Sticky CTAs always within thumb reach
- Video controls: Large, easy-to-tap interface elements
- Generous vertical spacing (py-8 to py-12 between sections)