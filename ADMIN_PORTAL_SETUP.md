# Management Admin Portal v1

## Architecture

Public staff survey remains at `/` and continues posting to `/api/submit`.

Protected management routes live under `/admin`.

Data path for Staff Wellbeing:

`Microsoft List: Staff Wellbeing Responses -> Power Automate read-only HTTP flow -> /api/admin/wellbeing -> /admin/wellbeing`

The browser never receives the Power Automate URL or its shared secret.

## Required Vercel environment variables

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET` (random value, minimum 32 characters)
- `POWER_AUTOMATE_READ_URL`
- `POWER_AUTOMATE_READ_SECRET`
- existing `POWER_AUTOMATE_URL` for public submissions

Do not use `NEXT_PUBLIC_` for any of these values.

Generate a bcrypt password hash locally with:

`node -e "console.log(require('bcryptjs').hashSync('REPLACE_WITH_PASSWORD', 12))"`

## Power Automate read-only flow

Create a new flow. Do not reuse the public survey submission flow.

1. Trigger: **When an HTTP request is received**.
2. The Next.js server will send a POST request with header `x-portal-secret` and body `{ "action": "readWellbeingResponses" }`.
3. Immediately validate the `x-portal-secret` header against a secret value stored only in the flow and in Vercel as `POWER_AUTOMATE_READ_SECRET`.
4. If the secret is invalid, terminate the flow with a failure/unauthorized response before reading SharePoint.
5. Use **Get items** on the private SharePoint/Microsoft List `Staff Wellbeing Responses`.
6. Use a Select action to return only the fields required by the dashboard. Do not return respondent identity fields. Raw Response is not required for this portal version.
7. Return HTTP 200 JSON in this shape:

```json
{
  "items": [
    {
      "submissionId": "...",
      "submittedAt": "...",
      "surveyMonth": "September 2026",
      "year": 2026,
      "language": "English",
      "team": "Academic",
      "schoolDivision": "DAIS Secondary",
      "department": "Science",
      "monthAhead": "I am holding steady",
      "lookingForward": "Something academic in class; Something personal",
      "notLookingForward": "Nothing",
      "focusAreas": "Student support; Getting Organized",
      "leadershipFeeling": "Supported",
      "monthAheadDetail": "",
      "lookingForwardDetail": "",
      "notLookingForwardDetail": "",
      "focusDetail": "",
      "leadershipDetail": ""
    }
  ]
}
```

### Stronger option when available

If the HTTP trigger in your tenant supports Microsoft Entra authentication, use it instead of relying only on a shared secret. If IT later grants an app registration, the server adapter can be replaced with Microsoft Graph using least-privilege Selected permissions without changing the admin UI.

## Security behavior

- `/admin/login` is public.
- All other `/admin/*` routes require a valid signed session cookie.
- `/api/admin/*` routes are also protected.
- Session lifetime is eight hours.
- Cookie is HTTP-only, SameSite=Lax, and Secure in production.
- Password verification happens only on the server using bcrypt.
- Power Automate read URL and secret are server-only environment variables.
- Management responses use `Cache-Control: no-store, private`.

## Expansion model

Add each future module as its own route and server adapter, for example:

- `/admin/learning-walks` + `/api/admin/learning-walks`
- `/admin/map` + `/api/admin/map`
- `/admin/operations` + `/api/admin/operations`
- `/admin/cover` + `/api/admin/cover`

Keep module-specific list/Graph/flow logic in `lib/` and reuse the shared authentication and `AdminShell`.
