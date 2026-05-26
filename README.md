# Shamba Pro Mobile

React Native mobile app for Shamba Pro — a sugarcane farm management platform for Kenyan farmers.

## Features

- **Dashboard** — KPI cards, profit/loss, quick actions
- **Plot Management** — Create, edit, and track sugarcane plots
- **Expense Tracking** — 23+ preset categories, quantity tracking
- **Harvest Recording** — Mill deductions, gross/net calculation
- **Loan Management** — Multiple loan types, repayment tracking
- **Season Budgets** — Budget vs actual variance analysis
- **Farm Analytics** — Monthly trends, category breakdown, plot performance
- **M-Pesa Subscriptions** — Monthly (KSH 120) & Yearly (KSH 1,200)
- **Bilingual** — English and Swahili

## Setup

1. **Clone and install**
   ```bash
   cd shamba-pro-mobile
   npm install
   ```

2. **Configure the API URL**
   ```bash
   cp .env.example .env
   # Edit .env and set EXPO_PUBLIC_API_BASE_URL to your Next.js backend URL
   ```

3. **Run**
   ```bash
   npx expo start
   ```

## Architecture

- **Expo SDK 52** with Expo Router (file-based navigation)
- **TanStack Query** for server state management
- **Zustand** for auth + settings state
- **React Hook Form + Zod** for form validation
- **react-native-gifted-charts** for analytics charts
- **i18next** for EN/SW translations
- **expo-secure-store** for JWT token storage

## API

Connects to the Shamba Pro Next.js backend. Auth is handled via Bearer tokens (JWT) through the `/api/mobile/auth/*` endpoints.

Set `EXPO_PUBLIC_API_BASE_URL` in your `.env` file.

## Screens

| Screen | Route |
|---|---|
| Login | `/(auth)/login` |
| Register | `/(auth)/register` |
| Dashboard | `/(app)/(tabs)` |
| Plots | `/(app)/(tabs)/plots` |
| Plot Detail | `/(app)/plots/[id]` |
| New Plot | `/(app)/plots/new` |
| Finances | `/(app)/(tabs)/finances` |
| Loans | `/(app)/(tabs)/loans` |
| More | `/(app)/(tabs)/more` |
| Analytics | `/(app)/analytics` |
| Budgets | `/(app)/budgets` |
| Pricing | `/(app)/pricing` |
| Settings | `/(app)/settings` |
| Admin | `/(app)/admin` |
