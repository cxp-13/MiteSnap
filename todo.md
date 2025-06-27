# Sun-Drying Feature Implementation Plan

## Architecture Analysis

### 1. Location Services Implementation
**Location**: `/src/app/dashboard/page.tsx` (lines 198-237)
- Uses browser's `navigator.geolocation.getCurrentPosition()` API
- Implements fallback to default location (40.7128, -74.0060) for unsupported browsers
- Includes error handling for geolocation failures
- Has optional reverse geocoding with OpenCage API (not fully implemented)

### 2. Weather API Integration  
**Location**: `/src/app/dashboard/page.tsx` (lines 166-196)
- Uses Tomorrow.io Weather API (`https://api.tomorrow.io/v4/weather/realtime`)
- Fetches temperature and humidity data based on latitude/longitude
- API key: `process.env.NEXT_PUBLIC_TOMORROW_API_KEY`
- Implements fallback to default weather data (22°C, 50% humidity) on API failure
- Headers include proper encoding and connection settings

### 3. AI Analysis Structure
**Location**: `/src/lib/ai-analysis.ts`
- Uses SiliconFlow API with Qwen2.5-VL-72B-Instruct model
- Analyzes duvet images with environmental context (temperature, humidity)
- Returns structured response: material detection, mite risk score (0-100), reasons
- Includes sophisticated risk scoring algorithm based on multiple factors
- API key: `process.env.NEXT_PUBLIC_SILICONFLOW_API_KEY`

### 4. Photo Upload with AI Analysis
**Location**: `/src/lib/storage.ts` + AI integration in dashboard
- Uses Supabase Storage (`images` bucket, `duvets/` folder)
- File naming: `{userId}-{timestamp}.{extension}`
- Returns public URL and file path
- AI analysis triggered after successful upload with image URL

### 5. Modal Implementation Pattern
**Location**: `/src/app/dashboard/page.tsx` (lines 592-1029)
- Fixed positioning with backdrop (`fixed inset-0 bg-black bg-opacity-50`)
- Multi-step modal with state management (`currentStep: 1|2|3|4`)
- Dynamic sizing based on content (`max-w-4xl` or `max-w-7xl`)
- Close button and backdrop click handling
- Progress indicators and loading states

### 6. Database Structure for Duvet Records
**Location**: `/src/lib/database.ts`
- Table: `quilts`
- Key fields:
  - `id`: string (primary key)
  - `name`: string
  - `material`: string
  - `mite_score`: number (0-100 risk score)
  - `image_url`: string
  - `user_id`: string
  - `last_clean`: string | null (ISO timestamp)
  - `created_at`: timestamp (for ordering)

## Implementation Plan

### Phase 1: Sun-Drying Modal Foundation
- [ ] **HIGH** Create dedicated sun-drying modal component
- [ ] **HIGH** Implement modal trigger from duvet card "晒被子" button
- [ ] **HIGH** Add modal state management in dashboard
- [ ] **MEDIUM** Create multi-step modal structure (location → weather → recommendation)

### Phase 2: Weather Analysis Integration
- [ ] **HIGH** Extend weather API call to include UV index and cloud cover
- [ ] **HIGH** Create sun-drying suitability algorithm
- [ ] **MEDIUM** Add weather condition analysis (sunny/cloudy/rainy)
- [ ] **MEDIUM** Implement optimal time window calculation

### Phase 3: AI-Powered Recommendations
- [ ] **HIGH** Create new AI prompt for sun-drying recommendations
- [ ] **HIGH** Integrate duvet material data with weather conditions
- [ ] **MEDIUM** Generate personalized sun-drying advice
- [ ] **MEDIUM** Add duration and timing recommendations

### Phase 4: Database and State Management
- [ ] **HIGH** Add sun-drying tracking fields to database schema
- [ ] **HIGH** Implement sun-drying session creation/tracking
- [ ] **MEDIUM** Update duvet record with last sun-dried date
- [ ] **LOW** Add sun-drying history to duvet details

### Phase 5: UI/UX Implementation
- [ ] **HIGH** Design sun-drying modal interface
- [ ] **HIGH** Add weather visualization components
- [ ] **MEDIUM** Implement recommendation display
- [ ] **MEDIUM** Add progress tracking for active sun-drying sessions
- [ ] **LOW** Add success confirmation and tips

### Phase 6: Enhanced Features
- [ ] **MEDIUM** Add sun-drying reminders/notifications
- [ ] **LOW** Implement optimal timing alerts
- [ ] **LOW** Add seasonal sun-drying recommendations
- [ ] **LOW** Create sun-drying effectiveness tracking

## Technical Considerations

### Code Patterns to Follow
1. **State Management**: Use existing useState patterns from dashboard
2. **API Integration**: Follow Tomorrow.io weather API pattern
3. **Modal Structure**: Replicate existing new duvet modal architecture
4. **Error Handling**: Implement fallbacks like current weather API
5. **Database Operations**: Use existing Supabase patterns from database.ts
6. **AI Integration**: Follow existing SiliconFlow API pattern

### Simplicity Requirements
- Reuse existing weather API infrastructure
- Extend current modal patterns rather than creating new ones
- Minimal database schema changes
- Use existing UI component patterns
- Leverage current geolocation implementation

## File Modifications Required

### New Files
- `/src/lib/sun-drying-analysis.ts` - AI analysis for sun-drying recommendations
- `/src/components/SunDryingModal.tsx` - Dedicated modal component (optional)

### Modified Files
- `/src/app/dashboard/page.tsx` - Add sun-drying modal and handlers
- `/src/lib/database.ts` - Add sun-drying tracking functions
- `/src/lib/ai-analysis.ts` - Extend for sun-drying analysis (optional)

### Environment Variables Needed
- Existing: `NEXT_PUBLIC_TOMORROW_API_KEY` (already configured)
- Existing: `NEXT_PUBLIC_SILICONFLOW_API_KEY` (already configured)
- Potential: Enhanced weather API endpoints if needed

## Review Section
*To be completed after implementation*