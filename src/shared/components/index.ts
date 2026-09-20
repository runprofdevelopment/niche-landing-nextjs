/**
 * Shared UI primitives and cross-feature components.
 *
 * Deep imports are still preferred for feature code (`@/shared/components/ui/*`,
 * `@/shared/components/dialogs`, etc.) but the barrel re-exports the common
 * pieces so ported features that use `@/shared/components` compile.
 */

// Feedback
export { notify, toast, ToastProvider } from "./feedback/toast";

// UI primitives
export { Button, buttonVariants } from "./ui/button";
export { Badge, badgeVariants } from "./ui/badge";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./ui/card";
export { Input } from "./ui/input";
export { Textarea } from "./ui/textarea";
export { Checkbox } from "./ui/checkbox";
export { Switch } from "./ui/switch";
export { Label } from "./ui/label";
export { Spinner } from "./ui/spinner";
export { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./ui/dropdown-menu";
export { Select, type SelectOption } from "./ui/select";
export { TimePicker, type TimePickerProps } from "./ui/time-picker";
export { InfiniteSelect } from "./ui/infinite-select";
export { MultiSelect, type MultiSelectOption } from "./ui/multi-select";
export { InternationalPhoneInput } from "./ui/international-phone-input";
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  // Alias to match ported feature imports.
  AccordionPanel as AccordionContent,
} from "./ui/accordion";
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  // Aliases so ported feature imports (`TabsTab`, `TabsPanel`) resolve.
  TabsTrigger as TabsTab,
  TabsContent as TabsPanel,
} from "./ui/tabs";

// Forms
export { Form, FormField } from "./forms";

// Dialogs
export {
  ConfirmDialog,
  type ConfirmDialogField,
  type ConfirmFieldValues,
  ConfirmDeleteDialog,
  BulkImportDialog,
  type BulkImportDialogProps,
} from "./dialogs";

// Table
export {
  DataTableView,
  useDataTable,
  useDataTableState,
  createAccessorColumn,
  createDisplayColumn,
  createSelectColumn,
  DataTableCell,
  DataTableColumnHeader,
  TableRowActionsTrigger,
  type ColumnDef,
  type DataTableFilterDef,
} from "./table";

// Auth
export { PermissionGate } from "./auth/permission-gate";
export { AccessDenied, AccessDenied as PermissionDenied } from "./auth/access-denied";

// Layout helpers (thin stubs for ported feature views)
export { PageHeader } from "./layout/page-header";
export { EmptyState } from "./layout/empty-state";
export { KpiCard } from "./layout/kpi-card";
export { SearchInput } from "./layout/search-input";
export { DetailRow, type DetailRowProps } from "./layout/detail-row";
