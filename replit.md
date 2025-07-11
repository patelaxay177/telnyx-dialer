# VoIP Dialer Application

## Overview

This is a full-stack VoIP dialer application built with React, Express, and PostgreSQL. The application provides a complete phone dialer interface with real-time call management, contact management, and integration with Telnyx for VoIP services. It features a modern UI built with shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom VoIP-specific color variables
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Real-time Communication**: WebSocket server for live call events
- **API Design**: RESTful endpoints for call and contact management

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Options**: In-memory storage implementation available for development/testing

## Key Components

### Core Features
1. **Dialer Interface**: Traditional phone keypad with number input and display
2. **Call Management**: Initiate, answer, hold, mute, transfer, and end calls
3. **Call History**: View past calls with status, duration, and contact information
4. **Contact Management**: Store and retrieve contact information
5. **Real-time Updates**: Live call status updates via WebSocket

### Frontend Components
- **DialerKeypad**: Interactive phone number input with DTMF tones
- **CallDisplay**: Shows current call status, number, and duration
- **CallControls**: Mute, hold, transfer, and merge call functions
- **CallHistory**: Historical call log with filtering and redial options
- **IncomingCallModal**: Modal for handling incoming calls
- **TransferModal**: Interface for call transfer functionality

### Backend Services
- **TelnyxService**: Integration with Telnyx VoIP API for call control
- **Storage Layer**: Abstracted storage interface supporting multiple backends
- **WebSocket Handler**: Real-time event broadcasting to connected clients

## Data Flow

### Call Initiation Flow
1. User enters phone number via keypad
2. Client sends call request to Express API
3. Server creates call record in database
4. Server initiates call via Telnyx API
5. WebSocket broadcasts call status updates
6. Client updates UI based on call state changes

### Real-time Communication
1. Client establishes WebSocket connection on page load
2. Server authenticates client with user ID
3. Call events from Telnyx webhook trigger WebSocket broadcasts
4. Connected clients receive real-time updates for call state changes

### Database Operations
1. Drizzle ORM provides type-safe database queries
2. Schema definitions in shared folder ensure type consistency
3. Migrations managed via Drizzle Kit for schema evolution
4. Support for both PostgreSQL and in-memory storage implementations

## External Dependencies

### Core Dependencies
- **Telnyx**: VoIP service provider for call control and telephony features
- **Neon Database**: Serverless PostgreSQL hosting
- **Radix UI**: Headless UI primitives for accessibility and behavior
- **TanStack Query**: Server state management and caching
- **WebSocket**: Real-time bidirectional communication

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle Kit**: Database schema management and migrations

### Integration Services
- **Telnyx Webhooks**: Receive real-time call events from Telnyx platform
- **WebSocket Server**: Custom implementation for client-server real-time communication

## Deployment Strategy

### Build Process
- **Client**: Vite builds React app to static assets in `dist/public`
- **Server**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **TELNYX_API_KEY**: Telnyx API authentication token
- **NODE_ENV**: Environment flag for development/production behavior

### Production Deployment
- Single Node.js process serves both API and static assets
- WebSocket server runs on same port as HTTP server
- Database migrations applied before server startup
- Environment variables configured for external service connections

### Development Workflow
- **Hot Reload**: Vite HMR for frontend development
- **API Proxy**: Vite dev server proxies API requests to Express
- **Database**: Local PostgreSQL or Neon cloud database
- **Real-time Testing**: WebSocket connections work in development mode