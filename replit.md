# EverAfter - Wedding Planner App

## Overview
EverAfter is a premium wedding planner mobile app built with Expo/React Native. It helps couples plan, organize, and manage their wedding with a romantic, calming aesthetic inspired by Apple Wallet, Notion, and high-end wedding magazines.

## Recent Changes
- 2026-02-20: Initial build - Dashboard, Budget, Guests, Tasks, Gifts screens
- 2026-02-20: Set up custom fonts (Playfair Display + Lora), gold/cream theme
- 2026-02-20: Generated app icon with interlocking rings design

## User Preferences
- Premium luxury UI with soft cream + gold accent palette
- Glassmorphism cards, elegant serif headlines
- Romantic, organized, calming emotional experience
- Apple Wallet + Notion dashboard + wedding magazine aesthetic

## Project Architecture
- **Frontend**: Expo Router with file-based routing, 5-tab navigation
- **State Management**: React Context (WeddingProvider) with AsyncStorage persistence
- **Fonts**: Playfair Display (headlines), Lora (body text)
- **Colors**: Cream (#FFF8F0), Gold (#C9A96E), Rose (#E8B4B8), Sage (#A8C5A0)
- **Tabs**: Home (Dashboard), Budget, Guests, Tasks, Gifts
- **Backend**: Express server on port 5000 (landing page + API ready)
- **Data**: All data persisted locally via AsyncStorage

## Key Files
- `app/(tabs)/index.tsx` - Dashboard with countdown, stats, overview
- `app/(tabs)/budget.tsx` - Budget planner with categories
- `app/(tabs)/guests.tsx` - Guest management with RSVP tracking
- `app/(tabs)/timeline.tsx` - Task checklist with priorities
- `app/(tabs)/gifts.tsx` - Gift tracker with thank-you reminders
- `lib/wedding-context.tsx` - Central state management
- `constants/colors.ts` - Theme color definitions
