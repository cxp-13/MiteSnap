# Remove deadline parameter from createOrder function

## Plan
I've analyzed the codebase and found that the `createOrder` function in `/home/cxp/indi_dev/mite-snap/src/lib/database.ts` currently has a `deadline` parameter that is no longer needed. The parameter is always being passed as `null` in all function calls, indicating it's not being used.

## Todo Items

- [ ] Remove deadline parameter from createOrder function signature in database.ts
- [ ] Remove deadline field from database insert operation in createOrder function  
- [ ] Update handleCreateOrder call in useOrders.ts to remove deadline parameter
- [ ] Update handleCreateOrder call in DuvetsPage.tsx to remove deadline parameter
- [ ] Verify all changes work correctly and no references to deadline remain

## Files to modify:
1. `/home/cxp/indi_dev/mite-snap/src/lib/database.ts` - Remove deadline parameter and database field
2. `/home/cxp/indi_dev/mite-snap/src/hooks/dashboard/useOrders.ts` - Update function call
3. `/home/cxp/indi_dev/mite-snap/src/app/dashboard/components/DuvetsPage.tsx` - Update function call

## Current State:
- The deadline parameter is defined on line 358 of database.ts
- It's inserted into the database on line 415 but always as null
- All function calls pass null for the deadline parameter
- The parameter appears to be unused legacy code