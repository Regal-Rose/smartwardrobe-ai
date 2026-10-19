# Milestone 10 — Outfit Planner

Added a responsive monthly calendar at `/planner`, linked from the sidebar.

## Included
- Browse previous/next month and jump to today.
- Select a date and assign an outfit from Saved Looks.
- Add an optional note, view plans for the selected day, and remove a plan.
- Calendar markers show dates with plans; multiple plans show a count.
- Planner entries persist across refreshes in the same browser using localStorage.

## Important limitation
Planner schedules are currently browser-local and are not synced to the backend or across devices. Backend support will be needed for account-level persistence and multi-device sync.

## Run
```bash
npm install
npm run dev
```
After login, choose **Outfit Planner** from the sidebar. Create/save at least one outfit first if Saved Looks is empty.
