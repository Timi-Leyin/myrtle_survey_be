# Questionnaire Update - Changes Summary

## Overview
The Myrtle Survey questionnaire has been updated from a simple single-select format to support both single-select and multi-select questions, enabling richer client profiling and more accurate recommendations.

## Key Changes

### 1. Question Labels (`src/utils/question-labels.ts`)
**Changes:**
- Added labels for all 16 questions (Q1-Q16)
- Added support for multi-select question codes:
  - Q2: STG1-STG6 (Financial Stages)
  - Q8: T1-T7 (Investment Goals)
  - Q15: SRC1-SRC8 (Sources of Funds)
- Updated `getQuestionLabel()` to handle both string and array inputs
- Returns comma-separated labels for multi-select answers

**Impact:** Questions now have proper human-readable labels that display nicely in emails and reports.

---

### 2. Net Worth Configuration (`src/utils/networth.config.ts`)
**Changes:**
- Updated Q4-Q7 to support 5 options (A-E) instead of 4 (A-D)
- Added "E" option for high net worth individuals:
  - Q4 (Cash): E = Above ₦1bn
  - Q5 (Real Estate): E = Above ₦1bn
  - Q6 (Business): E = Above ₦1bn
  - Q7 (Debts): E = Above ₦500m
- Adjusted midpoint calculations to reflect new ranges

**Impact:** Better captures Ultra High Net Worth Individuals (UHNI) with assets above ₦1bn.

---

### 3. Risk Configuration (`src/utils/risk.config.ts`)
**Changes:**
- Completely refactored risk scoring logic
- Q8 (Investment Goals) now multi-select with custom scoring:
  - T1 (Capital preservation): 1 point
  - T2 (Steady income): 2 points
  - T3 (Medium-term growth): 3 points
  - T4 (Aggressive growth): 4 points
  - T5 (Legacy building): 3 points
  - T6 (FX protection): 3 points
  - T7 (Wealth transfer): 2 points
  - Takes the **highest score** from selected goals
- Q9-Q10: Market reaction and comfort (HIGH→LOW: A=4, B=3, C=2, D=1)
- Q11-Q14: Loss tolerance, buffer, experience, liquidity (LOW→HIGH: A=1, B=2, C=3, D=4)
- Updated function signature to accept `Record<string, string | string[]>`

**Impact:** More nuanced risk profiling that considers multiple investment goals.

---

### 4. Persona Configuration (`src/utils/persona.config.ts`)
**Changes:**
- Rewrote persona determination logic based on new question structure:
  - Q1: Annual Income (INC1-INC6)
  - Q2: Financial Stage (multi-select: STG1-STG6)
  - Q3: Investment Horizon (T1-T4)
- New Private Wealth Niche rules:
  - NW4 (Private Wealth band) OR
  - NW3 + has STG4/STG5/STG6 in Q2 OR
  - High income (E/F) + has STG4/STG5/STG6 in Q2
- New Strategic Achiever rules:
  - (NW2 or NW3) AND
  - Income ≥ ₦5m (B-F) AND
  - Has growth/planning stages (STG2/3/4) AND
  - Medium+ horizon (B-D)
- Added helper function `hasStage()` to check multi-select Q2 answers

**Impact:** More accurate persona classification based on actual financial stage and income.

---

### 5. Scoring Service (`src/services/scoring.service.ts`)
**Changes:**
- Updated `calculateScores()` signature to accept `Record<string, string | string[]>`
- Passes multi-select answers to all scoring functions

**Impact:** Central scoring orchestrator now handles both answer types.

---

### 6. Questionnaire Controller (`src/controllers/questionnaire.controller.ts`)
**Changes:**
- Updated validation logic to handle multi-select questions (Q2, Q8, Q15)
- Single-select questions validated as strings (A-F)
- Multi-select questions validated as arrays with at least one selection
- Q15 (Sources of Funds) and Q16 (Advisor Message) are optional
- Removed filtered answers, now passes all answers to scoring
- Updated valid answer range from A-D to A-F

**Impact:** API now accepts and validates both single-select and multi-select formats.

---

### 7. Email Service (`src/services/email.service.ts`)
**Changes:**
- Updated function signature to accept `Record<string, string | string[]>`
- Added extraction of new questions:
  - Q1 (Income)
  - Q2 (Financial Stages - multi-select)
  - Q3 (Investment Horizon)
  - Q8 (Investment Goals - multi-select)
  - Q15 (Sources of Funds - multi-select)
  - Q16 (Advisor Message - text)
- Updated email HTML template:
  - Simplified Financial Identity section (uses persona narrative)
  - Shows only user-selected goals in section 4
  - Added section 8 for Sources of Funds (if provided)
  - Added section 9 for Advisor Message (if provided)
  - Uses conditional rendering (only shows filled sections)

**Impact:** Email is now personalized and shows only what the user provided.

---

### 8. Narrative Service (`src/services/narrative.service.ts`)
**Changes:**
- Complete rewrite of narrative text
- Added proper formatting with section dividers
- Included persona narrative in multiple sections
- Expanded explanations for each category
- Added structured next steps section
- Made it more professional and client-friendly

**Impact:** PDF narrative is now comprehensive, well-formatted, and easy to understand.

---

## New Features

### Multi-Select Support
Questions Q2, Q8, and Q15 now accept arrays of values:
```json
{
  "Q2": ["STG2", "STG3"],
  "Q8": ["T3", "T4", "T5"],
  "Q15": ["SRC2", "SRC4"]
}
```

### Extended Net Worth Ranges
Now captures UHNI clients with assets above ₦1bn across categories.

### Open Text Question
Q16 allows clients to share personal context with their advisor:
```json
{
  "Q16": "I'm interested in sustainable investments and ESG funds."
}
```

### Improved Email Narrative
- Shows only filled fields
- Properly formats multi-select answers as comma-separated lists
- Includes optional sections (sources of funds, advisor message)
- More engaging and personalized content

---

## Data Format Examples

### Before (Old Format)
```json
{
  "answers": {
    "Q1": "A",
    "Q2": "B",
    "Q3": "C",
    "Q4": "D",
    ...
  }
}
```

### After (New Format)
```json
{
  "answers": {
    "Q1": "D",
    "Q2": ["STG2", "STG3", "STG4"],
    "Q3": "C",
    "Q4": "D",
    "Q8": ["T3", "T4", "T5"],
    "Q15": ["SRC2", "SRC4"],
    "Q16": "Custom message to advisor"
  }
}
```

---

## Backward Compatibility
- Database schema unchanged (uses JSON fields)
- Old single-select answers still work
- New code handles both formats gracefully

---

## Testing Recommendations

### Unit Tests
1. Test multi-select answer handling in risk scoring
2. Test persona determination with Q2 arrays
3. Test email rendering with missing optional fields
4. Test validation for mixed single/multi-select answers

### Integration Tests
1. Submit questionnaire with all multi-select questions
2. Submit questionnaire with optional fields only
3. Submit questionnaire with Q16 (advisor message)
4. Verify email contains only filled fields
5. Test PDF generation with new narrative format

### API Tests
```bash
# Test with multi-select
POST /api/questionnaire/submit
{
  "Q2": ["STG2", "STG3"],
  "Q8": ["T3", "T4"]
}

# Test with optional fields
POST /api/questionnaire/submit
{
  "Q15": ["SRC1", "SRC2"],
  "Q16": "I have a question about tax efficiency"
}

# Test validation error (Q2 as string instead of array)
POST /api/questionnaire/submit
{
  "Q2": "STG2"  // Should fail validation
}
```

---

## Migration Checklist
- [✓] Update backend validation logic
- [✓] Update scoring algorithms
- [✓] Update email templates
- [✓] Update narrative generation
- [ ] Update frontend to send arrays for Q2, Q8, Q15
- [ ] Update frontend to handle Q16 text input
- [ ] Update frontend validation
- [ ] Test all question flows
- [ ] Update API documentation
- [ ] Deploy to staging environment
- [ ] Run integration tests
- [ ] Deploy to production

---

## Files Modified
1. `src/utils/question-labels.ts` - Added all question labels, multi-select support
2. `src/utils/networth.config.ts` - Extended ranges to E option
3. `src/utils/risk.config.ts` - Refactored for multi-select Q8
4. `src/utils/persona.config.ts` - Rewrote logic for Q1, Q2 (multi), Q3
5. `src/services/scoring.service.ts` - Updated type signatures
6. `src/services/narrative.service.ts` - Completely rewrote narrative
7. `src/services/email.service.ts` - Updated email template and data extraction
8. `src/controllers/questionnaire.controller.ts` - Updated validation logic

---

## Next Steps
1. **Frontend Development**: Update form to handle multi-select questions
2. **Testing**: Comprehensive testing of new validation and scoring logic
3. **Documentation**: Update API documentation for frontend team
4. **Training**: Brief team on new question structure
5. **Monitoring**: Monitor submissions for any validation errors

---

## Questions or Issues?
Contact the development team for any clarifications or if you encounter issues during testing.
