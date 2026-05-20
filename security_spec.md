# Security Specification for Sam's Barber Shop

## 1. Data Invariants
- A booking must have a valid service from the pre-defined list.
- A booking cannot be created with a past date (ideally, but Firestore rules have limited date math, so we'll enforce strict string format).
- Email must be a valid format.
- `createdAt` must be `request.time`.
- `status` must be `pending` on creation.

## 2. The "Dirty Dozen" Payloads (Expected to be REJECTED)
1. **Identity Spoofing**: Attempting to set `clientEmail` to someone else's email (if we had auth, but here it's a public form, so we protect via size/type).
2. **Ghost Field**: Adding `isPromoted: true` to a booking.
3. **Invalid Status**: Creating a booking with `status: 'confirmed'`.
4. **Invalid Type**: Setting `price` (not in schema) as a number.
5. **Resource Poisoning**: Setting `clientName` to a 1MB string.
6. **Path Poisoning**: Using `../` in a booking ID (if client-side ID generation).
7. **Timestamp Spoofing**: Providing a manual `createdAt` string instead of `request.time`.
8. **Invalid Enum**: `status: 'vip'`.
9. **Missing Fields**: Creating a booking without `clientEmail`.
10. **Wrong Format**: `createdAt: "not-a-date"`.
11. **Malicious ID**: Using a script tag as an ID.
12. **Update Hijack**: Trying to change the `service` of an existing booking.

## 3. The Test Runner (Conceptual)
All the above payloads should return `PERMISSION_DENIED` when attempted via the client SDK.
