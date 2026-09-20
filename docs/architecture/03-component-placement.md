# 03 — Component Placement

This document defines **exactly** where every type of component belongs. When in doubt, consult this table before creating a new file.

---

## Shared Component Categories

```
shared/components/
├── ui/             shadcn/ui primitives
├── forms/          Reusable form building blocks
├── table/          Generic table shells
├── navigation/     Nav, breadcrumbs, locale/theme controls
├── layout/         App shell structure
├── feedback/       Loading, empty, error UI
├── data-display/   Badges, avatars, stat cards
├── dialogs/        Modals, sheets, drawers
├── charts/         Chart wrappers
└── upload/         File upload UI
```

---

## Placement Reference

### `shared/components/ui/`

**What:** shadcn/ui primitives only. Added via `pnpm dlx shadcn@latest add <name>`.

**Why:** Single home for design-system primitives. No business logic, no API calls, no feature imports.

| Component      | Path                                     | Why                             |
| -------------- | ---------------------------------------- | ------------------------------- |
| `Button`       | `shared/components/ui/button.tsx`        | Primitive — no domain knowledge |
| `Input`        | `shared/components/ui/input.tsx`         | Primitive form control          |
| `Select`       | `shared/components/ui/select.tsx`        | Primitive dropdown              |
| `Badge`        | `shared/components/ui/badge.tsx`         | Primitive label                 |
| `Card`         | `shared/components/ui/card.tsx`          | Primitive container             |
| `Skeleton`     | `shared/components/ui/skeleton.tsx`      | Primitive loading placeholder   |
| `DropdownMenu` | `shared/components/ui/dropdown-menu.tsx` | Primitive menu                  |

**Wrong placement:**

- `SubmitBookingButton` in `ui/` — ❌ contains business intent → `features/bookings/components/`
- `UserRoleBadge` in `ui/` — ❌ domain-specific → `features/users/components/` or `data-display/`

---

### `shared/components/navigation/`

**What:** Route-aware and app-wide navigation controls.

**Why:** Navigation appears across the entire shell, not inside a single feature.

| Component          | Path                                                 | Why                        |
| ------------------ | ---------------------------------------------------- | -------------------------- |
| `LanguageSwitcher` | `shared/components/navigation/language-switcher.tsx` | App-wide locale control    |
| `ThemeToggle`      | `shared/components/navigation/theme-toggle.tsx`      | App-wide theme control     |
| `MainNav`          | `shared/components/navigation/main-nav.tsx`          | Primary navigation bar     |
| `Breadcrumbs`      | `shared/components/navigation/breadcrumbs.tsx`       | Route hierarchy display    |
| `SidebarNav`       | `shared/components/navigation/sidebar-nav.tsx`       | Sidebar link list          |
| `LocaleLink`       | `shared/components/navigation/locale-link.tsx`       | Wrapper around i18n `Link` |

**Wrong placement:**

- `BookingStatusTabs` — ❌ feature-specific → `features/bookings/components/`

---

### `shared/components/layout/`

**What:** App shell structure — wrappers that define page layout, not page content.

**Why:** Layout components frame content from any feature. They must not know about specific domains.

| Component         | Path                                            | Why                       |
| ----------------- | ----------------------------------------------- | ------------------------- |
| `AppShell`        | `shared/components/layout/app-shell.tsx`        | Root layout wrapper       |
| `Sidebar`         | `shared/components/layout/sidebar.tsx`          | Collapsible nav panel     |
| `Header`          | `shared/components/layout/header.tsx`           | Top bar with actions slot |
| `PageHeader`      | `shared/components/layout/page-header.tsx`      | Title + actions row       |
| `PageContainer`   | `shared/components/layout/page-container.tsx`   | Max-width content wrapper |
| `DashboardLayout` | `shared/components/layout/dashboard-layout.tsx` | Sidebar + main area       |

**Wrong placement:**

- `UsersSidebar` with user-specific links hardcoded — ❌ → compose `Sidebar` + pass nav items as props

---

### `shared/components/forms/`

**What:** Reusable form field wrappers that integrate React Hook Form + Zod.

**Why:** Every feature uses forms. Shared field components eliminate duplication without coupling to a domain.

| Component         | Path                                            | Why                      |
| ----------------- | ----------------------------------------------- | ------------------------ |
| `FormField`       | `shared/components/forms/form-field.tsx`        | Label + error wrapper    |
| `TextField`       | `shared/components/forms/text-field.tsx`        | RHF + Input integration  |
| `SelectField`     | `shared/components/forms/select-field.tsx`      | RHF + Select integration |
| `DatePickerField` | `shared/components/forms/date-picker-field.tsx` | RHF + date picker        |
| `FormSection`     | `shared/components/forms/form-section.tsx`      | Grouped field layout     |

**Wrong placement:**

- `CreateUserForm` — ❌ feature-specific → `features/users/components/create-user-form.tsx`
- `BookingDateRangePicker` with booking rules — ❌ → `features/bookings/components/`

---

### `shared/components/table/`

**What:** Generic TanStack Table shells — sorting, pagination, column helpers.

**Why:** Table infrastructure is identical across features. Only column definitions and row data differ.

| Component             | Path                                                | Why                                  |
| --------------------- | --------------------------------------------------- | ------------------------------------ |
| `DataTable`           | `shared/components/table/data-table.tsx`            | Generic table with sorting/filtering |
| `DataTablePagination` | `shared/components/table/data-table-pagination.tsx` | Reusable pagination bar              |
| `DataTableToolbar`    | `shared/components/table/data-table-toolbar.tsx`    | Search + filter slot                 |
| `ColumnHeader`        | `shared/components/table/column-header.tsx`         | Sortable column header               |

**Wrong placement:**

| Component       | Correct Path                                      | Why                            |
| --------------- | ------------------------------------------------- | ------------------------------ |
| `UsersTable`    | `features/users/components/users-table.tsx`       | Domain-specific columns + data |
| `BookingsTable` | `features/bookings/components/bookings-table.tsx` | Uses `DataTable` internally    |

---

### `shared/components/feedback/`

**What:** User feedback — loading, success, error, empty states.

| Component        | Path                                             | Why                 |
| ---------------- | ------------------------------------------------ | ------------------- |
| `Toast`          | `shared/components/feedback/toast.tsx`           | Global notification |
| `AlertBanner`    | `shared/components/feedback/alert-banner.tsx`    | Inline alert        |
| `EmptyState`     | `shared/components/feedback/empty-state.tsx`     | No-data placeholder |
| `LoadingSpinner` | `shared/components/feedback/loading-spinner.tsx` | Generic loader      |
| `PageSkeleton`   | `shared/components/feedback/page-skeleton.tsx`   | Full-page loading   |

**Wrong placement:**

- `NoBookingsFound` with booking-specific illustration — ❌ → `features/bookings/components/` (or pass props to `EmptyState`)

---

### `shared/components/data-display/`

**What:** Presentational components for rendering structured data.

| Component      | Path                                                | Why                      |
| -------------- | --------------------------------------------------- | ------------------------ |
| `StatCard`     | `shared/components/data-display/stat-card.tsx`      | KPI display              |
| `Avatar`       | `shared/components/data-display/avatar.tsx`         | User image + fallback    |
| `StatusBadge`  | `shared/components/data-display/status-badge.tsx`   | Generic status indicator |
| `KeyValueList` | `shared/components/data-display/key-value-list.tsx` | Label-value pairs        |

**Wrong placement:**

- `VehiclePlateBadge` — ❌ domain-specific → `features/vehicles/components/`

---

### `shared/components/dialogs/`

**What:** Modal, sheet, and drawer primitives.

| Component       | Path                                           | Why                        |
| --------------- | ---------------------------------------------- | -------------------------- |
| `ConfirmDialog` | `shared/components/dialogs/confirm-dialog.tsx` | Generic yes/no modal       |
| `Sheet`         | `shared/components/dialogs/sheet.tsx`          | Slide-over panel           |
| `AlertDialog`   | `shared/components/dialogs/alert-dialog.tsx`   | Destructive action confirm |

**Wrong placement:**

- `DeleteUserDialog` — ❌ → `features/users/components/delete-user-dialog.tsx`

---

### `shared/components/charts/`

**What:** Wrappers around charting libraries.

| Component        | Path                                           | Why                        |
| ---------------- | ---------------------------------------------- | -------------------------- |
| `BarChart`       | `shared/components/charts/bar-chart.tsx`       | Generic bar chart wrapper  |
| `LineChart`      | `shared/components/charts/line-chart.tsx`      | Generic line chart wrapper |
| `ChartContainer` | `shared/components/charts/chart-container.tsx` | Responsive chart shell     |

**Wrong placement:**

- `RevenueChart` with finance-specific axes — ❌ → `features/finance/components/`

---

### `shared/components/upload/`

**What:** File upload UI.

| Component        | Path                                           | Why                  |
| ---------------- | ---------------------------------------------- | -------------------- |
| `FileDropzone`   | `shared/components/upload/file-dropzone.tsx`   | Drag-and-drop upload |
| `UploadProgress` | `shared/components/upload/upload-progress.tsx` | Progress indicator   |

**Wrong placement:**

- `VehiclePhotoUpload` with vehicle validation — ❌ → `features/vehicles/components/`

---

## Feature Components

**What:** UI that belongs to exactly one business domain.

| Component             | Path                                                     | Why                       |
| --------------------- | -------------------------------------------------------- | ------------------------- |
| `UsersTable`          | `features/users/components/users-table.tsx`              | User-specific columns     |
| `CreateUserForm`      | `features/users/components/create-user-form.tsx`         | User creation flow        |
| `UserCard`            | `features/users/components/user-card.tsx`                | User display card         |
| `BookingsCalendar`    | `features/bookings/components/bookings-calendar.tsx`     | Booking-specific calendar |
| `VehicleDetailsPanel` | `features/vehicles/components/vehicle-details-panel.tsx` | Vehicle domain UI         |
| `AgencySettingsForm`  | `features/agencies/components/agency-settings-form.tsx`  | Agency configuration      |
| `FinanceSummaryCards` | `features/finance/components/finance-summary-cards.tsx`  | Finance KPIs              |

---

## Placement Decision Flow

```
Is it a shadcn/ui primitive?
  → shared/components/ui/

Is it used by 2+ features AND has no domain logic?
  → shared/components/<category>/

Is it specific to one business domain?
  → features/<name>/components/

Is it a Next.js page/layout?
  → app/[locale]/
```

---

## Before Creating a New Component

1. Search `shared/components/` — does something similar exist?
2. Can an existing shared component accept props instead of a new component?
3. Is this truly feature-specific? If yes → `features/`.
4. Will a second feature need this within 2 sprints? If yes → start in `shared/`.
