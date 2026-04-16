# PTO Planner — Bug Bash Test Plan

## Devices to test
- [ ] Desktop (Chrome)
- [ ] Desktop (Safari)
- [ ] iOS Safari
- [ ] Android Chrome

---

## Setup Tab

- [ ] Add a PTO bucket — form opens, saves, appears in list
- [ ] Add a bucket with no name — shows validation error
- [ ] Edit a bucket — changes persist
- [ ] Delete a bucket — removed from list, confirm dialog appears
- [ ] Empty state shows "No PTO buckets yet" message
- [ ] "Add bucket" button visible in empty state and at bottom of list
- [ ] On mobile: Edit/Delete buttons appear at bottom of card, full width

---

## Timeline Tab

- [ ] 24-month projection renders correctly
- [ ] Starting balances editable inline at top
- [ ] Changing starting balance updates projection immediately
- [ ] Empty state shows "No PTO buckets" with "Go make a bucket" button
- [ ] "Go make a bucket" navigates to Setup tab
- [ ] Red text for negative balances
- [ ] Amber text + lock icon for at-cap balances
- [ ] Legend visible at bottom; floating pill appears when legend scrolls off
- [ ] Add event — opens form, saves, appears inline under correct month
- [ ] Edit event — changes persist
- [ ] Delete event (desktop: trash icon in row; mobile: delete button in drawer)
- [ ] Event name, description, and budget display correctly (description/budget desktop only)
- [ ] Mid-dots between event name, description, and budget

---

## About Tab

- [ ] Plane animation fades out, smiley slides in on load
- [ ] Ko-fi roulette spins on tab load
- [ ] Ko-fi roulette spins on hover
- [ ] Roulette does not re-trigger mid-spin
- [ ] Roulette has cooldown after landing
- [ ] Ko-fi link underline spans full width

---

## Navigation

- [ ] Desktop: tabs in header
- [ ] Mobile: tabs in fixed bottom nav
- [ ] Active tab is semi-bold
- [ ] Plane animation: grounded on Setup, takes off on Timeline, smiley on About

---

## Export / Import

- [ ] Export downloads a valid JSON file
- [ ] Import restores data from a valid JSON file
- [ ] Import shows confirm dialog before overwriting
- [ ] Import rejects invalid files with an alert
- [ ] Desktop: Export/Import buttons in header
- [ ] Mobile: Export/Import in "More" bottom sheet

---

## PWA / Install

- [ ] iOS: Share > Add to Home Screen installs as "PTO Planner"
- [ ] App opens without browser chrome after install
- [ ] Theme color matches brand blue in browser tab / status bar
- [ ] Plane favicon visible in browser tab

---

## iOS-specific

- [ ] Inputs do not zoom on focus
- [ ] Form elements are not blue/dark-mode-styled
- [ ] Save button works in bucket form
- [ ] Save button works in event form
- [ ] Drawers scroll when content overflows keyboard
