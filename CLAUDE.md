# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Use-Case Trends MVP - A Next.js 14 dashboard for exploring social posts and detected trends. Built with TypeScript, Tailwind CSS, and client-side state management using local in-memory data.

## Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

## Architecture

### Core Structure
- **Next.js 14 App Router**: Modern React framework with file-based routing
- **TypeScript**: Full type safety across components and data models
- **Tailwind CSS**: Utility-first styling with responsive design
- **Client-side state**: React hooks for local state management, no external API calls

### Key Directories
- `app/`: Next.js app router pages and layout
- `components/`: Reusable UI components (FiltersBar, KPICards, TrendsTable, TrendDrawer, Sparkline)
- `lib/`: Core utilities (types.ts, metrics.ts)
- `data/`: Seed data (trends, posts, postTrends)

### Data Model
- **Post**: Social media posts with engagement metrics
- **Trend**: Categorized trends with metadata
- **PostTrend**: Many-to-many relationship linking posts to trends
- **TrendMetrics**: Aggregated analytics per trend

### Key Features
- Multi-select search term filtering
- Date range presets (7d/14d/30d)
- Min engagement slider
- Sortable trends table ranked by total engagement
- WoW growth calculation with status indicators (Emerging/Stable/Declining)
- Right-side drawer with sparkline visualization and top posts
- KPI cards showing active trends, eligible posts, total engagement, new trends

### Engagement Calculation
If post.engagement_score is 0: likes*1 + retweets*3 + replies*2 + bookmarks*2.5

### Status Logic
- 🚀 Emerging: current≥200 & growth≥0.5 & prev<100
- 📉 Declining: prev≥200 & growth≤−0.3
- 📊 Stable: everything else