# Quick Reference: Scoring Logic

## 📊 Net Worth Calculation

```
Net Worth = Q4 + Q5 + Q6 - Q7
```

### Midpoint Values

| Answer | Q4 (Cash)    | Q5 (Real Estate) | Q6 (Business)  | Q7 (Debts)     |
|--------|-------------|------------------|----------------|----------------|
| A      | ₦2.5m       | ₦0               | ₦0             | ₦0             |
| B      | ₦27.5m      | ₦25m             | ₦25m           | ₦12.5m         |
| C      | ₦150m       | ₦150m            | ₦150m          | ₦62.5m         |
| D      | ₦625m       | ₦625m            | ₦625m          | ₦300m          |
| E      | ₦1.25bn     | ₦1.25bn          | ₦1.25bn        | ₦750m          |

### Net Worth Bands

| Code | Band           | Range              |
|------|----------------|--------------------|
| NW1  | Emerging       | ₦0 - ₦20m          |
| NW2  | Mass Affluent  | ₦20m - ₦100m       |
| NW3  | Affluent       | ₦100m - ₦250m      |
| NW4  | Private Wealth | ₦250m+             |

---

## 🎯 Risk Score Calculation (Max: 28 points)

### Q8: Investment Goals (Multi-Select - Take Highest)

| Code | Goal                              | Points |
|------|-----------------------------------|--------|
| T1   | Capital preservation / safety     | 1      |
| T2   | Steady income                     | 2      |
| T3   | Medium-term growth                | 3      |
| T4   | Long-term aggressive growth       | 4      |
| T5   | Legacy building                   | 3      |
| T6   | FX protection                     | 3      |
| T7   | Wealth transfer & continuity      | 2      |

**Example:** User selects `[T3, T4, T5]` → Score = 4 (highest)

### Q9-Q10: HIGH → LOW Scoring

| Answer | Points | Q9 Reaction    | Q10 Comfort    |
|--------|--------|----------------|----------------|
| A      | 4      | Buy more       | Very comfortable |
| B      | 3      | Stay invested  | Moderate       |
| C      | 2      | Reduce exposure| Slightly uncomfortable |
| D      | 1      | Exit immediately | Not comfortable |

### Q11-Q14: LOW → HIGH Scoring

| Answer | Points | Q11 Loss    | Q12 Buffer  | Q13 Experience | Q14 Liquidity |
|--------|--------|-------------|-------------|----------------|---------------|
| A      | 1      | 0% (No loss)| Limited     | None           | Very high     |
| B      | 2      | Up to 5%    | Moderate    | Beginner       | Moderate      |
| C      | 3      | Up to 10%   | Strong      | Moderate       | Low           |
| D      | 4      | Above 10%   | Very strong | Experienced    | No need       |

### Risk Profile Bands

| Score Range | Profile      | Description                                    |
|-------------|--------------|------------------------------------------------|
| 0-12        | Conservative | Values capital protection and stability        |
| 13-18       | Moderate     | Balances safety with steady returns            |
| 19-23       | Growth       | Comfortable with calculated risks for gains    |
| 24-28       | Aggressive   | Seeks strong growth, comfortable with volatility|

---

## 👤 Persona Determination

### Decision Tree

```
┌─────────────────────────────────────────────────────────┐
│ Is Net Worth Band = NW4 (Private Wealth)?               │
├─────────────────────────────────────────────────────────┤
│ YES → Private Wealth Niche                              │
│                                                          │
│ NO → Continue ↓                                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Is NW3 AND Q2 includes (STG4 OR STG5 OR STG6)?         │
├─────────────────────────────────────────────────────────┤
│ YES → Private Wealth Niche                              │
│                                                          │
│ NO → Continue ↓                                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Is Q1 = (E OR F) AND Q2 includes (STG4/5/6)?           │
├─────────────────────────────────────────────────────────┤
│ YES → Private Wealth Niche                              │
│                                                          │
│ NO → Continue ↓                                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Is (NW2 OR NW3) AND                                     │
│    Q1 = (B/C/D/E/F) AND                                 │
│    Q2 includes (STG2/3/4) AND                           │
│    Q3 = (B/C/D)?                                        │
├─────────────────────────────────────────────────────────┤
│ YES → Strategic Achiever                                │
│                                                          │
│ NO → Everyday Builder                                   │
└─────────────────────────────────────────────────────────┘
```

### Persona Criteria Summary

| Persona                | Criteria                                                          |
|------------------------|-------------------------------------------------------------------|
| **Private Wealth Niche** | • NW4 OR<br>• NW3 + Advanced Stage (STG4/5/6) OR<br>• High Income (₦100m+) + Advanced Stage |
| **Strategic Achiever**   | • NW2/NW3<br>• Income ≥ ₦5m<br>• Growth/Planning Stage (STG2/3/4)<br>• Medium+ Horizon (1+ years) |
| **Everyday Builder**     | • All other combinations                                          |

### Persona Narratives

| Persona | Description |
|---------|-------------|
| **Everyday Builder** | Building a solid foundation with disciplined savings, smart budgeting, and strategic investments that grow steadily over time. |
| **Strategic Achiever** | Actively expanding wealth through diversified investments, income growth strategies, and long-term financial planning. |
| **Private Wealth Niche** | Managing significant assets with focus on preservation, legacy, governance, tax efficiency, and intergenerational continuity. |

---

## 📋 Question Type Reference

### Single-Select Questions (String)
```json
"Q1": "D",
"Q3": "C",
"Q4": "D",
"Q5": "C",
"Q6": "D",
"Q7": "B",
"Q9": "B",
"Q10": "A",
"Q11": "C",
"Q12": "C",
"Q13": "C",
"Q14": "C"
```

### Multi-Select Questions (Array)
```json
"Q2": ["STG2", "STG3", "STG4"],
"Q8": ["T3", "T4", "T5"],
"Q15": ["SRC2", "SRC4"]
```

### Open Text (Optional)
```json
"Q16": "I'm interested in ESG investments and would like to discuss options for sustainable portfolios."
```

---

## 🔍 Example Calculation

### Input
```json
{
  "Q1": "D",                          // ₦40m-₦100m income
  "Q2": ["STG2", "STG3", "STG4"],    // Growth stages
  "Q3": "C",                          // Long-term horizon
  "Q4": "D",                          // ₦625m cash
  "Q5": "C",                          // ₦150m real estate
  "Q6": "D",                          // ₦625m business
  "Q7": "B",                          // ₦12.5m debts
  "Q8": ["T3", "T4", "T5"],          // Growth + Legacy goals
  "Q9": "B",                          // Stay invested (3 pts)
  "Q10": "A",                         // Very comfortable (4 pts)
  "Q11": "C",                         // Up to 10% loss (3 pts)
  "Q12": "C",                         // Strong buffer (3 pts)
  "Q13": "C",                         // Moderate experience (3 pts)
  "Q14": "C"                          // Low liquidity need (3 pts)
}
```

### Calculations

**Net Worth:**
```
₦625m + ₦150m + ₦625m - ₦12.5m = ₦1,387.5m
→ NW4 (Private Wealth)
```

**Risk Score:**
```
Q8: max(3, 4, 3) = 4
Q9: 3
Q10: 4
Q11: 3
Q12: 3
Q13: 3
Q14: 3
─────────
Total: 23 → Growth Profile
```

**Persona:**
```
NW4 = Private Wealth
→ Private Wealth Niche ✓
```

### Output
```json
{
  "netWorth": 1387500000,
  "netWorthBand": "NW4-Private Wealth",
  "riskScore": 23,
  "riskProfile": "Growth",
  "persona": "Private Wealth Niche",
  "portfolio": {
    "cash": 10,
    "income": 25,
    "growth": 30,
    "fx": 25,
    "alternatives": 10
  }
}
```

---

## 🎨 Portfolio Recommendations

| Persona + Risk | Cash | Income | Growth | FX | Alternatives |
|----------------|------|--------|--------|-----|--------------|
| Everyday Builder + Moderate | 60% | 30% | 10% | - | - |
| Strategic Achiever + Growth | 15% | 35% | 30% | 20% | - |
| Private Wealth + Aggressive | 10% | 25% | 30% | 25% | 10% |
| Other combinations | Custom allocation | | | | |

---

## 📧 Email Sections (Conditional Rendering)

| Section | Always Shown | Conditional | Data Source |
|---------|--------------|-------------|-------------|
| 1. Financial Identity | ✓ | | Persona |
| 2. Net Worth Position | ✓ | | Q4-Q7 calculation |
| 3. Investment Personality | ✓ | | Risk score/profile |
| 4. Goals & Behaviour | | Only if Q8-Q10, Q14 present | User selections |
| 5. Recommended Pathway | ✓ | | Portfolio allocation |
| 6. Portfolio Blueprint | ✓ | | Portfolio allocation |
| 7. Wealth Story | ✓ | | Persona narrative |
| 8. Sources of Funds | | Only if Q15 present | Q15 selections |
| 9. Advisor Message | | Only if Q16 present | Q16 text |
| 10. Next Steps | ✓ | | Standard text |

---

This reference guide provides a quick overview of all scoring logic and decision trees used in the questionnaire system.
