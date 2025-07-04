# Research Todo List

## Completed Tasks ✅
1. **Examine DuvetCard component to understand current data structure** - COMPLETED
2. **Find and analyze the Duvet interface/type definition** - COMPLETED  
3. **Research how DuvetList component fetches and passes data** - COMPLETED
4. **Examine address management and fetching in AddressManager** - COMPLETED
5. **Trace data flow from database to DuvetCard component** - COMPLETED

## In Progress 🔄
6. **Document findings and recommendations for adding address data** - IN PROGRESS

---

# Research Findings: Address Data Integration for Duvets

## Current Data Flow Analysis

### 1. Duvet Data Structure
**File**: `/home/cxp/indi_dev/mite-snap/src/lib/database.ts`
```typescript
export interface Duvet {
  id: string
  name: string
  material: string
  mite_score: number
  image_url: string
  user_id: string
  address_id: string | null  // 📍 Address link exists!
  last_clean: string | null
  status: DuvetStatus
}
```

**Key Finding**: The `Duvet` interface already includes an `address_id` field that links to addresses, but this relationship is not currently being used in the UI.

### 2. Address Data Structure
**File**: `/home/cxp/indi_dev/mite-snap/src/lib/database.ts`
```typescript
export interface Address {
  id: string
  is_default: boolean | null
  user_id: string
  longitude: number | null
  latitude: number | null
  country: string | null
  state: string | null
  city: string | null
  district: string | null
  road: string | null
  house_number: string | null
  neighbourhood: string | null
  address_line: string | null
  created_at: string
  // Legacy fields...
}
```

### 3. Current Data Flow
1. **DuvetsPage** (`/home/cxp/indi_dev/mite-snap/src/app/dashboard/components/DuvetsPage.tsx`)
   - Uses `useDuvets` hook to fetch duvet data
   - Uses `useAddresses` hook to fetch address data (separately)
   - Passes duvets to DuvetList component

2. **useDuvets Hook** (`/home/cxp/indi_dev/mite-snap/src/hooks/dashboard/useDuvets.ts`)
   - Calls `getUserDuvets(userId)` from database module
   - Returns raw duvet data without address information

3. **Database Layer** (`/home/cxp/indi_dev/mite-snap/src/lib/database.ts`)
   - `getUserDuvets()` only fetches duvet data
   - `getAddressesByIds()` function exists but is not used for duvets

4. **DuvetCard Component** (`/home/cxp/indi_dev/mite-snap/src/components/dashboard/DuvetCard.tsx`)
   - Currently shows hardcoded "Located in bedroom area" (line 61)
   - Does not receive any address data

## Recommendations for Adding Address Information

### Option 1: Database Join Query (Recommended)
**Pros**: Most efficient, single query
**Cons**: Requires database query modification

**Implementation**:
1. Modify `getUserDuvets()` to join with addresses table
2. Create extended interface for duvet with address data
3. Update DuvetCard to display actual address

### Option 2: Fetch Addresses Separately and Match (Simpler)
**Pros**: No database changes needed, uses existing functions
**Cons**: Multiple queries, more complex logic

**Implementation**:
1. Use existing `getAddressesByIds()` function
2. Extract address IDs from duvets
3. Match addresses to duvets in the component

### Option 3: Enhance Current Data Flow (Balanced)
**Pros**: Minimal changes, maintainable
**Cons**: Slightly more complex state management

**Implementation**:
1. Modify `useDuvets` hook to fetch addresses for duvets
2. Return combined data structure
3. Update DuvetCard to receive address data

## Current Address Display Logic
**File**: `/home/cxp/indi_dev/mite-snap/src/components/dashboard/AddressManager.tsx`

The AddressManager already has excellent address formatting functions:
- `getPrimaryAddress()` - Creates main address line (house number + street)
- `getSecondaryAddress()` - Creates secondary line (neighborhood/district)
- `getLocationLabel()` - Creates location label (city)

These functions can be reused for DuvetCard address display.

## Next Steps
1. Choose implementation approach
2. Implement data fetching changes
3. Update DuvetCard component to display address information
4. Test with different address formats
5. Handle edge cases (missing addresses, formatting issues)

---

## Current Status
- Research phase complete
- Ready to implement address data integration
- All necessary functions and interfaces identified
- Multiple implementation paths evaluated