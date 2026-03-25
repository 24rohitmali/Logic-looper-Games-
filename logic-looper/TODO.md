# Logic Looper - Implementation TODO

## Priority 1: Core Features
- [ ] 1. Puzzle Validation - Validate all 5 puzzle types client-side
- [ ] 2. Daily Unlock System - Enforce "only today's puzzle unlocked"
- [ ] 3. Streak System - Better edge case handling, timezone support
- [ ] 4. Heatmap - GitHub-style 7-row grid (365 days)

## Priority 2: Backend & Sync
- [ ] 5. Backend Sync - POST /sync/daily-scores endpoint with validation
- [ ] 6. Offline Background Sync - Sync when back online

## Priority 3: UI Polish
- [ ] 7. Animations - Smooth puzzle interactions
- [ ] 8. Completion Animation - Streak fire indicator
- [ ] 9. Mobile Responsive - Ensure works on mobile

## Implementation Notes:
- Puzzle types: Sudoku, Pattern, Sequence, Deduction, Binary
- Seed: SHA256(date + secret_key)
- Storage: IndexedDB for offline first
- Sync: POST /api/sync/daily-scores
