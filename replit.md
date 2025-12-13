# ikonetU - Video-First Dealflow Platform

## Overview

ikonetU is a secure, scalable video-first dealflow platform that connects startup founders with investors. The platform combines TikTok's immersive video experience with LinkedIn's professional credibility and Tinder's intuitive matching mechanics. Founders create 60-second pitch videos that investors discover through a vertical feed, with mutual matching leading to in-app messaging and deal progression.

The MVP is designed to support up to 1,000 initial users and validate the core business loop: **Attract → Discover → Signal → Match → Connect**.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query for server state management and caching

**UI Component System**
- Shadcn/ui (Radix UI primitives) for accessible, customizable components
- Tailwind CSS for styling with custom design tokens
- New York style variant with custom color system and spacing units
- Custom theme system supporting light/dark modes via React Context

**Design System**
- Typography: Inter (primary) and Space Grotesk (headers) from Google Fonts
- Spacing: Tailwind units (2, 4, 8, 12, 16) for consistent layout
- Mobile-first responsive design with bottom tab navigation
- Full-screen vertical video feed for discovery experience

**State Management**
- AuthContext for user authentication state and profile data
- ThemeContext for dark/light mode preferences
- TanStack Query for API data fetching, caching, and synchronization
- Session-based authentication with express-session

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for API routes
- HTTP server with WebSocket support (ws library) for real-time messaging
- Session management using connect-pg-simple (PostgreSQL session store)
- Password hashing with Node.js crypto (scrypt algorithm)

**API Design**
- RESTful endpoints under `/api` prefix
- Role-based access control (founder, investor, admin)
- Session-based authentication with middleware guards
- JSON request/response format with proper error handling

**Core Business Logic**
- Video discovery feed filtered by investor preferences (sector, stage, location)
- Three-signal system: Interested (❤️), Maybe (🤔), Pass (✖️)
- Mutual matching: Founder must accept investor interest to create match
- Real-time chat via WebSockets for matched pairs
- Basic moderation workflow for flagged content

**Authentication & Authorization**
- Password-based authentication with secure hashing
- Role-based permissions (founder, investor, admin)
- Session middleware for protected routes
- Legal consent tracking with timestamps

### Data Storage

**Database**
- PostgreSQL as the primary relational database
- Drizzle ORM for type-safe database queries and migrations
- Schema-first approach with Zod validation

**Core Data Models**
- **Users**: Email/password auth, role assignment, onboarding status
- **Founder Profiles**: Company info, bio, sector, stage, funding goals
- **Investor Profiles**: Firm details, investment thesis, preference chips (sectors, stages, support types)
- **Videos**: 60-second pitch videos with status (processing, active, rejected, archived)
- **Signals**: Investor reactions to founder videos (interested, maybe, pass)
- **Matches**: Mutual connections between founders and investors
- **Messages**: Text-only chat history within matches
- **Legal Consent**: Timestamped NDA/terms acceptance
- **Reports**: User-flagged content for moderation

**Data Relationships**
- One-to-one: User → Founder/Investor Profile
- One-to-many: Founder → Videos, Match → Messages
- Many-to-many: Founders ↔ Investors (via Signals and Matches)

### External Dependencies

**UI Component Libraries**
- @radix-ui/* (15+ primitive components): Accessible UI building blocks
- embla-carousel-react: Carousel functionality
- cmdk: Command palette component
- lucide-react: Icon library

**Data & Validation**
- drizzle-orm: PostgreSQL ORM with type inference
- drizzle-zod: Schema-to-Zod validation generator
- zod: Runtime type validation and parsing
- @hookform/resolvers: Form validation integration

**Styling & Utilities**
- tailwindcss: Utility-first CSS framework
- class-variance-authority: Type-safe component variants
- clsx + tailwind-merge: Conditional class name utilities
- date-fns: Date formatting and manipulation

**Backend Services**
- pg: PostgreSQL client for Node.js
- express-session: Session management middleware
- connect-pg-simple: PostgreSQL session store adapter
- ws: WebSocket server for real-time messaging
- multer: Multipart form data handling (video uploads)

**Development Tools**
- tsx: TypeScript execution for development
- esbuild: Fast JavaScript bundler for production
- @replit/* plugins: Replit-specific development enhancements

**Planned Integrations** (not yet implemented)
- Video processing/encoding service for optimization
- Cloud storage for video files (S3-compatible)
- Email service for notifications (nodemailer dependency present)