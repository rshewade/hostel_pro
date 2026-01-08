# Parent User Records - Architecture Decision

**Date:** January 8, 2026  
**Status:** Documented - No Action Required

## Question

Are parent user records required in the database, or can parent login work solely via applications and profiles data?

## Answer

**Parent user records are OPTIONAL.** The system can authenticate and retrieve student data without parent user records by using applications and profiles data.

## How Parent Login Works

### Authentication Flow

1. Parent enters mobile number (e.g., `9876543210`)
2. System sends OTP (`123456`)
3. Parent enters OTP → receives session token
4. System looks up students by matching parent mobile number

### Data Sources (Priority Order)

The API `/api/parent/student/route.ts` searches for students from **3 sources**:

#### 1. Applications (Line 75-80)
Matches parent mobile in `guardian_info`:
```javascript
const applications = await find('applications', (app: any) => {
  const fatherMobile = normalizePhone(app.data?.guardian_info?.father_mobile || '');
  const motherMobile = normalizePhone(app.data?.guardian_info?.mother_mobile || '');
  return fatherMobile === normalizedParentMobile || motherMobile === normalizedParentMobile;
});
```

#### 2. Profiles (Line 82-87)
Matches parent mobile in `details`:
```javascript
const profiles = await find('profiles', (profile: any) => {
  const fatherMobile = normalizePhone(profile.details?.father_mobile || '');
  const motherMobile = normalizePhone(profile.details?.mother_mobile || '');
  return fatherMobile === normalizedParentMobile || motherMobile === normalizedParentMobile;
});
```

#### 3. Parent User Record (Line 71-73) - Fallback
```javascript
const parentUser = await findOne('users', (u: any) => 
  u.role === 'parent' && normalizePhone(u.mobile_no) === normalizedParentMobile
);
```

### Multi-Student Support

The API returns all students found across sources:

```javascript
return NextResponse.json({
  success: true,
  data: students.length === 1 ? students[0] : students, // Array if multiple children
});
```

## Current Data Structure

### db.json Contains

```json
"users": [
  {
    "id": "parent1",
    "email": "...",
    "role": "parent",
    "mobile_no": "9876543210",
    "linked_student_id": "STU001",  // Optional explicit mapping
    "status": "ACTIVE"
  }
]

"profiles": [
  {
    "id": "p1",
    "user_id": "u1",
    "full_name": "Rahul Kumar",
    "profile_type": "student",
    "details": {
      "father_mobile": "+919876543220",
      "mother_mobile": "+919876543221"
    }
  }
]

"applications": [
  {
    "id": "app1",
    "data": {
      "guardian_info": {
        "father_mobile": "+919876543220",
        "mother_mobile": "+919876543225"
      }
    }
  }
]
```

## Implication

### Parent User Records Are Redundant IF:

1. All student profiles have accurate `father_mobile` / `mother_mobile` in `details`
2. All applications have accurate parent mobile in `guardian_info`
3. System relies on applications and profiles for student lookup

### Parent User Records Still Useful FOR:

1. **Explicit mapping** - When parent mobile is not in applications/profiles
2. **Historical data** - Students who applied before parent mobile was tracked
3. **Multiple parent support** - Both father's and mother's mobile can be linked to same student

## Recommendation

**Keep parent user records as optional/legacy** for backward compatibility, but system can function without them. New implementations can:

1. Skip creating parent user records
2. Ensure parent mobile is always captured in profiles
3. Keep applications `guardian_info` updated

## Related Files

| File | Purpose |
|------|---------|
| `/frontend/src/app/api/parent/student/route.ts` | Multi-source student lookup |
| `/frontend/src/app/dashboard/parent/page.tsx` | Student selector UI for multiple children |
| `/frontend/src/app/login/parent/page.tsx` | OTP-based parent login |

## Test Data

| Parent Mobile | Student(s) | Login Method |
|---------------|------------|--------------|
| 9876543210 | Rahul Kumar | Applications + Profiles |
| 9876543220 | Amit Shah | Applications + Profiles + Parent User |
| 9876543221 | Neha Shah | Applications + Profiles + Parent User |

All parents can login using OTP `123456` without requiring parent user records in the database.
