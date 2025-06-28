# Plan: Add "Request Help Drying" Button to Duvet Cards

## Analysis
I have located the duvet cards rendering section in the dashboard component at `/home/cxp/indi_dev/SunSpec/sun-spec/src/app/dashboard/page.tsx`.

### Current Structure (Lines 915-1030):
- Grid layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Duvet cards mapped from `duvets.map((duvet) => { ... })`
- Each card contains:
  - Duvet photo (lines 955-964)
  - Card content in `p-6 space-y-6` div (lines 966-1025)
  - Duvet name (lines 968-972)
  - Urgency indicator for days since last dry (lines 975-982)
  - Mite level with progress bar (lines 985-1000)
  - **Sun Dry button section (lines 1002-1024)**

### Target Location for New Button:
The "Request Help Drying" button should be added alongside the existing "Sun Dry" button in the section starting at line 1002. Currently, this section shows either:
- A "Currently Sun Drying" status (when actively drying)
- A single "Sun Dry" button (when not drying)

## Todo Items

### ✅ 1. Locate duvet cards rendering section
- [x] Found in `/home/cxp/indi_dev/SunSpec/sun-spec/src/app/dashboard/page.tsx`
- [x] Identified exact location: lines 1002-1024
- [x] Analyzed current button structure

### ⏸️ 2. Design button layout modification
- [ ] Modify the button section to show two buttons side by side when not currently sun drying
- [ ] Keep the "Currently Sun Drying" status display unchanged
- [ ] Ensure buttons are responsive and maintain good spacing

### ⏸️ 3. Implement "Request Help Drying" button
- [ ] Add the new button with appropriate styling to match the existing "Sun Dry" button
- [ ] Use a different color scheme to differentiate it from the Sun Dry button
- [ ] Add appropriate icon and text
- [ ] Include onClick handler (placeholder for now)

### ⏸️ 4. Test button layout and responsiveness
- [ ] Verify buttons display correctly on different screen sizes
- [ ] Ensure buttons don't break the card layout
- [ ] Check that existing functionality remains intact

## Notes
- Keep changes minimal and focused only on the button section
- Maintain existing styling patterns and responsive design
- The modification should only affect the non-sun-drying state (lines 1012-1023)
- Preserve all existing functionality

## Review Section
*To be completed after implementation*