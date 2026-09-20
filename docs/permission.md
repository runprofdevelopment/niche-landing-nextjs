# Permissions Reference (Niche Panels)

Permission keys follow `<resource>.<action>`. Check them before **every view** and **every mutation** (create / update / delete / share / …).

Hooks:

- `usePermissions()` → `{ can, canView, canAdd, canCreate, canEdit, canUpdate, canDelete, canCrud, isAdmin, permissions }`
- `useCanPermission(key)` → boolean for one key
- `PermissionGate` → wrap a page/section; shows Access Denied when missing
- Sidebar filters `dashboardNavItems` by each item’s `permission` key

Source: `src/hooks/usePermissions.ts`  
Gate: `src/shared/components/auth/permission-gate.tsx`  
Catalog: `src/constants/permissions.ts`  
Hydration: `AuthProvider` reads `profile.permissions` into a `Set`. `profile.role === "admin"` bypasses checks. Until the backend returns permissions, the provider seeds **all** catalog keys so local UI keeps working.

---

## Rule: every view is permission-gated

| Layer                                | Requirement                                                     |
| ------------------------------------ | --------------------------------------------------------------- |
| Sidebar / nav                        | Each item needs a `*.view` key; hide links the user cannot open |
| Page / route                         | Guard with `canView("<resource>")` (or redirect / empty state)  |
| List / detail UI                     | Show only if `*.view`                                           |
| Add / Create buttons                 | `*.create` (`canAdd` / `canCreate`)                             |
| Edit actions                         | `*.update` (`canEdit` / `canUpdate`)                            |
| Delete actions                       | `*.delete`                                                      |
| Extra mutations (share, check-in, …) | Dedicated keys (e.g. `invitation.share`)                        |

**Do not** show CRUD controls without the matching permission. Backend must still enforce the same keys on GraphQL/REST mutations.

---

## Catalog (by feature)

### Dashboard

| Key              | Description             |
| ---------------- | ----------------------- |
| `dashboard.view` | Open the dashboard home |

### Events

| Key            | Description        |
| -------------- | ------------------ |
| `event.view`   | List / open events |
| `event.create` | Create event       |
| `event.update` | Edit event         |
| `event.delete` | Delete event       |

### Halls (layout / setup / designer)

| Key           | Description                      |
| ------------- | -------------------------------- |
| `hall.view`   | View halls / designer            |
| `hall.create` | Create hall                      |
| `hall.update` | Update hall config + layout save |
| `hall.delete` | Delete hall                      |

### Guests

| Key            | Description             |
| -------------- | ----------------------- |
| `guest.view`   | Guest list              |
| `guest.create` | Add guest / bulk import |
| `guest.update` | Edit guest              |
| `guest.delete` | Delete guest            |

**Mutations (when wired):**

| Operation                   | Permission     |
| --------------------------- | -------------- |
| `CreateGuest` / bulk import | `guest.create` |
| `UpdateGuest`               | `guest.update` |
| `DeleteGuest`               | `guest.delete` |
| `EventGuests` query         | `guest.view`   |

### Seating

| Key              | Description                     |
| ---------------- | ------------------------------- |
| `seating.view`   | Open seat map                   |
| `seating.update` | Assign seats / **Save seating** |

### Invitations

| Key                 | Description                   |
| ------------------- | ----------------------------- |
| `invitation.view`   | Invitation studio / templates |
| `invitation.create` | Create / save template        |
| `invitation.update` | Edit invitation               |
| `invitation.delete` | Delete template               |
| `invitation.share`  | Share invitation to guests    |

### Check-in

| Key              | Description           |
| ---------------- | --------------------- |
| `checkIn.view`   | Check-in UI / scanner |
| `checkIn.update` | Check in / out guests |

### Security

| Key                        | Description                   |
| -------------------------- | ----------------------------- |
| `security.view`            | Security / Front Desk Members |
| `security.members.create`  | Add front desk members        |
| `security.members.update`  | Edit front desk members       |
| `security.members.delete`  | Delete front desk members     |
| `security.members.approve` | Approve pending members       |
| `security.members.reject`  | Reject members (with reason)  |

### Reports / Settings / Users / Requests / Staff

| Key                                                             | Description     |
| --------------------------------------------------------------- | --------------- |
| `report.view`                                                   | Reports section |
| `report.overview.view`                                          | Overview        |
| `report.analytics.view`                                         | Analytics       |
| `settings.view`                                                 | Settings        |
| `settings.update`                                               | Change settings |
| `user.view` / `user.create` / `user.update` / `user.delete`     | Users CRUD      |
| `user.roles.view`                                               | Roles UI        |
| `request.view` / `request.update`                               | Requests        |
| `staff.view` / `staff.create` / `staff.update` / `staff.delete` | Staff CRUD      |

---

## Hook usage

```tsx
import { GUEST_PERMISSIONS } from "@/constants/permissions";
import { usePermissions, useCanPermission } from "@/hooks/usePermissions";

function GuestsToolbar() {
  const { canAdd, can } = usePermissions();
  const canViewGuests = useCanPermission(GUEST_PERMISSIONS.view);

  if (!canViewGuests) return null;

  return (
    <>
      {canAdd("guest") ? <Button>Add Guest</Button> : null}
      {can(GUEST_PERMISSIONS.update) ? <Button>Edit</Button> : null}
    </>
  );
}
```

Gate mutations the same way before calling Apollo:

```ts
if (!can(GUEST_PERMISSIONS.create)) throw new Error("Forbidden");
await createGuest(...);
```

---

## Adding a new resource

1. Add `<FEATURE>_PERMISSIONS` in `src/constants/permissions.ts` (always include `.view` for screens) and register it in `PERMISSIONS`.
2. Document keys in this file.
3. Attach `.view` on the matching nav item when filtering the sidebar.
4. Annotate GraphQL ops with `# permission: <resource>.<action>`.
5. Gate UI with `usePermissions()` / `useCanPermission()`.

Keys here must match what the backend returns in `user.permissions` / `Me.permissions`.
