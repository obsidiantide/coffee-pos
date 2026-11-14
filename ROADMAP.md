# Roadmap

## A. Core Features
- [ ] Split-payment (cash + card) at checkout
- [ ] Product search and favourites on the POS screen
- [ ] Low-stock indicators in admin menu

## B. Test Coverage
- [x] Vitest setup, cart store and formatters
- [x] Auth store
- [ ] Component tests for `ShiftManager` and `AddExpenseModal`
- [ ] Backend: analytics utilities and order preparation tracking (pytest)

## C. Architecture & Refactoring
- [ ] Extract shared modal shell from the Shift* modals
- [x] Replace `any` in API error handling with a typed `getErrorMessage` helper

## D. Performance & Polish
- [x] Route-level code splitting for admin pages
- [ ] Dark theme for the POS screen
- [ ] Touch-friendly sizing for tablet layout
