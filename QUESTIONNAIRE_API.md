# Myrtle Survey Backend - Updated Questionnaire API

## Overview

The questionnaire has been updated to support both **single-select** and **multi-select** questions, providing more flexibility in capturing client financial profiles.

## Question Types

### Single-Select Questions (String Answers)
Questions that accept a single answer (A, B, C, D, E, or F):
- **Q1**: Annual Income
- **Q3**: Investment Horizon
- **Q4**: Cash & Liquid Assets
- **Q5**: Real Estate Holdings
- **Q6**: Business Assets
- **Q7**: Total Debts
- **Q9**: Market Drop Reaction
- **Q10**: Comfort with Fluctuations
- **Q11**: Loss Tolerance
- **Q12**: Financial Buffer
- **Q13**: Investment Experience
- **Q14**: Liquidity Requirement

### Multi-Select Questions (Array Answers)
Questions that accept multiple selections:
- **Q2**: Financial Stage (STG1-STG6)
- **Q8**: Investment Goals (T1-T7)
- **Q15**: Sources of Funds (SRC1-SRC8) - Optional

### Open Text Questions
- **Q16**: Message to Advisor - Optional

## Question Details

### Q1: Annual Income (Single-Select)
```
A - Below ₦5m
B - ₦5m–₦20m
C - ₦20m–₦40m
D - ₦40m–₦100m
E - ₦100m–₦500m
F - Above ₦500m
```

### Q2: Financial Stage (Multi-Select)
```
STG1 - Building stability
STG2 - Growing income / expanding career or business
STG3 - Preparing long-term financial plans
STG4 - Wealth expansion & asset consolidation
STG5 - Preparing for legacy transfer / succession
STG6 - Managing multi-generational wealth
```

### Q3: Investment Horizon (Single-Select)
```
A - Short-term (0–12 months)
B - Medium-term (1–3 years)
C - Long-term (3–5 years)
D - Very long-term (5+ years)
```

### Q4: Cash & Liquid Assets (Single-Select)
```
A - Below ₦5m
B - ₦5m–₦50m
C - ₦50m–₦250m
D - ₦250m–₦1bn
E - Above ₦1bn
```

### Q5: Real Estate Holdings (Single-Select)
```
A - None
B - Below ₦50m
C - ₦50m–₦250m
D - ₦250m–₦1bn
E - Above ₦1bn
```

### Q6: Business Assets (Single-Select)
```
A - None
B - Below ₦50m
C - ₦50m–₦250m
D - ₦250m–₦1bn
E - Above ₦1bn
```

### Q7: Total Debts (Single-Select)
```
A - None
B - Below ₦25m
C - ₦25m–₦100m
D - ₦100m–₦500m
E - Above ₦500m
```

### Q8: Investment Goals (Multi-Select)
```
T1 - Capital preservation / safety
T2 - Steady income
T3 - Medium-term growth
T4 - Long-term aggressive growth
T5 - Legacy building
T6 - FX protection / currency diversification
T7 - Wealth transfer & continuity
```

### Q9: Market Drop Reaction (Single-Select)
```
A - Buy more
B - Stay invested
C - Reduce exposure
D - Exit immediately
```

### Q10: Comfort with Fluctuations (Single-Select)
```
A - Very comfortable
B - Moderate
C - Slightly uncomfortable
D - Not comfortable at all
```

### Q11: Loss Tolerance (Single-Select)
```
A - 0% (No loss)
B - Up to 5%
C - Up to 10%
D - Above 10%
```

### Q12: Financial Buffer (Single-Select)
```
A - Limited buffer — I may need liquidity often
B - Moderate buffer — I can stay invested
C - Strong buffer — little need for liquidity
D - Very strong buffer — I invest for the long game
```

### Q13: Investment Experience (Single-Select)
```
A - None
B - Beginner
C - Moderate
D - Experienced
```

### Q14: Liquidity Requirement (Single-Select)
```
A - Very high liquidity (may need access anytime)
B - Moderate liquidity (6–12 months)
C - Low liquidity (1–3 years)
D - No liquidity need (3+ years)
```

### Q15: Sources of Funds (Multi-Select, Optional)
```
SRC1 - Salary / Employment Income
SRC2 - Business Income
SRC3 - Rental Income
SRC4 - Investment Income (Dividends, Interest)
SRC5 - Asset Sale
SRC6 - Family Support / Gifts
SRC7 - Diaspora Remittance
SRC8 - Others
```

### Q16: Message to Advisor (Open Text, Optional)
User can provide a free-form message to their advisor.

## API Request Example

### POST `/api/questionnaire/submit`

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+2348012345678",
  "gender": "Male",
  "dateOfBirth": "1985-06-15",
  "occupation": "Business Owner",
  "address": "123 Victoria Island, Lagos",
  "maritalStatus": "Married",
  "dependantsCount": 2,
  "answers": {
    "Q1": "D",
    "Q2": ["STG2", "STG3", "STG4"],
    "Q3": "C",
    "Q4": "D",
    "Q5": "C",
    "Q6": "D",
    "Q7": "B",
    "Q8": ["T3", "T4", "T5"],
    "Q9": "B",
    "Q10": "A",
    "Q11": "C",
    "Q12": "C",
    "Q13": "C",
    "Q14": "C",
    "Q15": ["SRC2", "SRC4"],
    "Q16": "I'd like to discuss diversification into international markets."
  }
}
```

## Scoring Logic

### Net Worth Calculation
- **Q4 + Q5 + Q6 - Q7** = Net Worth
- Uses midpoint values for each range
- Net Worth Bands:
  - **NW1 (Emerging)**: ₦0 - ₦20m
  - **NW2 (Mass Affluent)**: ₦20m - ₦100m
  - **NW3 (Affluent)**: ₦100m - ₦250m
  - **NW4 (Private Wealth)**: ₦250m+

### Risk Scoring (Max: 28 points)
- **Q8**: Multi-select investment goals (highest score from selections)
  - T1 (Capital preservation): 1 point
  - T2 (Steady income): 2 points
  - T3 (Medium-term growth): 3 points
  - T4 (Aggressive growth): 4 points
  - T5 (Legacy building): 3 points
  - T6 (FX protection): 3 points
  - T7 (Wealth transfer): 2 points
- **Q9-Q10**: HIGH→LOW (A=4, B=3, C=2, D=1)
- **Q11-Q14**: LOW→HIGH (A=1, B=2, C=3, D=4)

Risk Profile Bands:
- **Conservative**: 0-12 points
- **Moderate**: 13-18 points
- **Growth**: 19-23 points
- **Aggressive**: 24-28 points

### Persona Determination
Based on Net Worth Band, Q1 (Income), Q2 (Financial Stage), and Q3 (Investment Horizon):

**Private Wealth Niche** if:
- NW4 (Private Wealth band) OR
- NW3 + has STG4/STG5/STG6 in Q2 OR
- Q1 = E/F (income ₦100m+) + has STG4/STG5/STG6 in Q2

**Strategic Achiever** if:
- (NW2 or NW3) AND
- Q1 = B/C/D/E/F (income ₦5m+) AND
- Has STG2/STG3/STG4 in Q2 AND
- Q3 = B/C/D (investment horizon 1+ years)

**Everyday Builder**: Default for all other combinations

## Response Format

```json
{
  "success": true,
  "data": {
    "submission": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2025-12-02T10:30:00.000Z"
    },
    "analysis": {
      "netWorth": 675000000,
      "netWorthBand": "NW4-Private Wealth",
      "riskScore": 20,
      "riskProfile": "Growth",
      "persona": "Private Wealth Niche",
      "portfolio": {
        "cash": 10,
        "income": 25,
        "growth": 30,
        "fx": 25,
        "alternatives": 10
      },
      "narrative": "🌿 MYRTLE WEALTH BLUEPRINT™..."
    }
  }
}
```

## Email Notification

Upon successful submission, the user receives an email with:
1. **Financial Identity** - Their persona classification
2. **Net Worth Position** - Calculated net worth and band
3. **Investment Personality** - Risk profile and score
4. **Goals & Behaviour** - Selected goals and preferences
5. **Recommended Pathway** - Suggested portfolio allocation
6. **Portfolio Blueprint** - Detailed allocation breakdown
7. **Wealth Story** - Personalized narrative
8. **Sources of Funds** - If provided (Q15)
9. **Message to Advisor** - If provided (Q16)
10. **Next Steps** - Onboarding process overview

The email only shows what the user filled in, making it clean and personalized.

## Validation Rules

1. **Required Questions**: Q1-Q14 must be present
2. **Single-Select**: Must be string values (A-F)
3. **Multi-Select**: Must be arrays with at least one selection
4. **Optional**: Q15 (multi-select), Q16 (text)
5. All answers are stored in the database for future reference

## Migration Notes

- Existing questionnaires with old format will still work
- New format supports backward compatibility
- Frontend should be updated to send arrays for Q2, Q8, Q15
- Frontend should validate answer formats before submission
