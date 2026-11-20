# Roadmap

## A. Core Features
- [ ] Split-payment (cash + card) at checkout
- [x] Product search on the POS screen (favourites still open)
- [ ] Low-stock indicators in admin menu

## B. Test Coverage
- [x] Vitest setup, cart store and formatters
- [x] Auth store
- [ ] Component tests for `ShiftManager` and `AddExpenseModal`
- [x] Backend: analytics utilities (pytest)
- [ ] Backend: order preparation tracking endpoints (pytest)

## C. Architecture & Refactoring
- [x] Extract shared modal shell from the Shift* modals
- [x] Replace `any` in API error handling with a typed `getErrorMessage` helper

## D. Performance & Polish
- [x] Route-level code splitting for admin pages
- [ ] Dark theme for the POS screen
- [ ] Touch-friendly sizing for tablet layout
