# Event Seat Planner

Build the Event Hall & Seating Layout flow for the Operations Admin dashboard.

Important Product Decision

The user does NOT know or need to enter the real physical dimensions of the hall (meters, feet, etc.).

Do NOT ask for:

Hall width in meters

Hall height in meters

Physical dimensions

The system should use a logical coordinate/grid system internally only for positioning and rendering.

The hall is defined by its visual boundary/shape, and the user arranges tables and other objects visually inside that boundary.

1. Create Event

The Operations Admin can create an Event.

Fields:

Event Name

Bride Name

Groom Name

Event Date

Start Time

End Time

Venue Name

Expected Guests

Language

After creating the event, redirect to:

Event Details

The Event Details page should contain setup sections:

Hall & Seating

Guests

Invitations

Timeline

2. Create Hall

Inside the Event Details page, the admin can create a Hall.

Hall fields:

Hall Name

Expected Guests / Guest Count

Do NOT ask for physical dimensions.

The admin chooses the hall boundary shape:

Rectangle

Square

Circle

Custom Polygon

For Custom Polygon:

Allow the user to draw the hall boundary by clicking points on the canvas.

Example:

      ●──────────────●
     /                \
    /                  ●

/ /
●──────────────────●

After completing the shape, the system treats this as the available hall area.

3. Hall Layout Designer

After creating the hall, open a visual Hall Designer.

Use a suitable React canvas/editor library.

Preferred library:

React Konva + Konva

Use it for:

Canvas rendering

Drag & Drop

Pan

Zoom

Grid

Snap to Grid

Multi-select

Move

Resize

Rotate

Selection

Object positioning

Do not use the browser's raw pixel coordinates as the source of truth.

Use a logical coordinate system internally.

Example:

{
x: 120,
y: 80,
width: 40,
height: 40
}

These values are logical units, NOT physical meters and NOT fixed screen pixels.

The renderer should convert logical coordinates to screen pixels depending on the current zoom and viewport.

This allows the exact same layout to be rendered later in:

Desktop Operations Dashboard

Guest Mobile App

Security App

4. Grid

The Hall Designer should have a visible grid.

Grid features:

Show / Hide Grid

Snap to Grid

Adjustable grid density

Zoom

Pan

The grid is an editor helper only.

Do not save grid lines as objects.

The grid should help users:

Align tables

Keep consistent spacing

Position objects

Avoid accidental overlaps

5. Table Library

Tables are created/configured before entering the Hall Designer.

Example:

Round Table
Capacity: 8
Quantity: 20

Rectangle Table
Capacity: 10
Quantity: 10

Square Table
Capacity: 4
Quantity: 5

Inside the Hall Designer, display the available tables in a left-side library.

Example:

TABLES

○ Round Table
8 seats
20 available

▭ Rectangle Table
10 seats
10 available

□ Square Table
4 seats
5 available

The admin can drag a table from the library into the hall.

6. Table Size

Do NOT require the admin to manually enter Width/Height when placing tables.

Use predefined visual size presets based on the table type.

Allow the admin to resize the table visually using resize handles.

For example:

        ↗
    ┌────────┐
    │        │
    │ TABLE  │
    │        │
    └────────┘
             ↘

For round tables, preserve the circular aspect ratio.

The actual logical width/height should be stored internally.

7. Table Capacity → Automatic Seats

The admin should NOT manually draw every seat.

If a table has:

Capacity = 8

the system automatically generates:

Seat 1
Seat 2
Seat 3
Seat 4
Seat 5
Seat 6
Seat 7
Seat 8

Arrange the seats around the table automatically.

For a round table:

       ● Seat 1

● ●

Seat 8 ○ Seat 2

● ●

       ● Seat 5

The exact visual arrangement can be adjusted depending on capacity.

Seats should move with their parent table.

If the table moves, all its seats move with it.

If the table is rotated, its seats rotate with it.

8. Other Hall Objects

Create an object library for non-table elements.

Categories:

Venue

Stage

Entrance

Exit

Dance Floor

Buffet

DJ

Screen

Areas

VIP Area

Restricted Area

Dining Area

Decoration

Decoration

Flowers

Cake

Photo Area

Navigation

Walkway

9. Object Behavior

Different objects can behave differently.

Fixed/Resizable Objects

Examples:

Stage

Dance Floor

VIP Area

Buffet

Allow:

Move

Resize

Rotate

Delete

The user should resize them visually instead of entering Width/Height manually.

The Properties Panel may show advanced values:

Position
X
Y

Size
Width
Height

Rotation

But these should be optional/advanced.

10. Drawable Objects

Some objects should be created by drawing.

Custom Hall

User clicks points to create a polygon.

Walkway

Allow the user to draw a path:

●────────────●
│
│
●

Custom Area / VIP Area

Allow the user to draw a polygon.

Store polygon points using the logical coordinate system.

Example:

{
type: "polygon",
points: [
{ x: 100, y: 100 },
{ x: 500, y: 100 },
{ x: 600, y: 400 },
{ x: 100, y: 400 }
]
}

11. Collision & Placement Rules

When placing an object, validate its position.

For tables:

Table must stay inside the hall boundary.

Tables should not overlap.

Tables should not overlap the Stage.

Tables should not block the Entrance.

Tables should not overlap restricted areas.

Show clear visual feedback:

Valid:

✓ Valid placement

Invalid:

✕ Cannot place table here

Use visual highlighting when an object is in an invalid position.

12. Hall Capacity

Do not ask the admin to manually calculate hall seating capacity.

Calculate it from tables.

Example:

20 Round Tables × 8 = 160 seats

10 Rectangle Tables × 10 = 100 seats

Total Seating Capacity = 260

Show:

Expected Guests
500

Available Seats
260

⚠ Not enough seats

If:

Expected Guests = 500
Available Seats = 500

show:

✓ Seating capacity is sufficient

13. Seating Assignment

Create a separate screen from the Hall Designer.

Do NOT mix guest assignment deeply into the Hall Designer.

The Hall Designer answers:

Where are the tables and objects?

The Seating Assignment screen answers:

Which guest sits where?

14. Seating Assignment UI

Create a three-column layout:

┌──────────────┬─────────────────────────┬───────────────┐
│ │ │ │
│ GUESTS │ HALL MAP │ DETAILS │
│ │ │ │
│ Search │ STAGE │ Selected │
│ │ │ Guest │
│ Ahmed │ ○ T1 ○ T2 │ Ahmed Ali │
│ Sara │ │ │
│ Mohamed │ ○ T3 ○ T4 │ Table T1 │
│ Noura │ │ Seat 3 │
│ │ │ │
└──────────────┴─────────────────────────┴───────────────┘

15. Guest Assignment UX

Primary interaction:

Drag Guest → Table

Example:

Ahmed Ali

dragged to:

Table 12

Then show:

Table 12

Capacity: 8
Assigned: 1 / 8
Available: 7

The system automatically assigns the guest to the next available seat.

Example:

Ahmed → Seat 1

16. Manual Seat Assignment

Allow the admin to open a table and manually change seats.

Example:

Table 12

Seat 1 Ahmed
Seat 2 Sara
Seat 3 Omar
Seat 4 Noura
Seat 5 Empty
Seat 6 Empty
Seat 7 Empty
Seat 8 Empty

Allow drag/drop between seats.

17. Guest Groups / Families

Support assigning groups/families.

Example:

Al-Harbi Family
8 Guests

Al-Qahtani Family
12 Guests

Bride Friends
6 Guests

Groom Friends
10 Guests

Allow:

Drag Family → Table

Example:

Al-Harbi Family
8 guests

→ Table 12
Capacity 10

Automatically assign the family members to available seats.

18. Guest ↔ Seat Data Relationship

Do NOT link guests directly to pixel coordinates.

Use:

Guest
↓
Seat
↓
Table

Example:

Guest {
id: "guest-1"
name: "Ahmed Ali"
seatId: "seat-128"
}

Seat {
id: "seat-128"
tableId: "table-12"
number: 4
x: 128
y: 82
}

Table {
id: "table-12"
x: 120
y: 80
}

If Table 12 moves, the seat and guest remain associated with that table/seat.

19. Recommended Data Model

Use a structure similar to:

type HallLayout = {
hallId: string;

coordinateSystem: {
width: number;
height: number;
};

objects: HallObject[];
};

type HallObject = {
id: string;

type:
| "table"
| "stage"
| "entrance"
| "exit"
| "vip"
| "walkway"
| "dance-floor"
| "buffet"
| "decoration";

x: number;
y: number;

width?: number;
height?: number;

rotation: number;

zIndex: number;

tableId?: string;
};

type Seat = {
id: string;

tableId: string;

number: number;

x: number;
y: number;

rotation: number;

guestId?: string;
};

Use logical coordinates as the source of truth.

20. Designer Layout

Create the Hall Designer with:

Top Toolbar

← Back

Hall Designer

Undo
Redo

Grid
Snap

Zoom -
Zoom +
Fit

Preview

Save

Left Panel

TABLES

Round
Rectangle
Square

OBJECTS

Stage
Entrance
Exit
VIP
Walkway
Dance Floor
Buffet
Decoration

Center

Interactive React Konva canvas.

Right Panel

Properties of selected object:

Selected: Table 12

Type
Round Table

Capacity
8

Position
X
Y

Size
Width
Height

Rotation

21. Important UX Principle

Do NOT make this feel like AutoCAD.

The Operations Admin should mostly interact using:

Drag

Drop

Move

Resize

Rotate

Snap

Click

Select

Avoid forcing users to enter numerical dimensions.

Advanced numerical values can exist in the Properties panel but should not be required.

22. Mobile Rendering

The saved layout must be independent from desktop screen pixels.

The backend stores logical coordinates:

x
y
width
height
rotation

The mobile app converts them to its own screen coordinates.

Example:

Backend
x = 120
y = 80

        ↓

Desktop Renderer
scale = 1.5

        ↓

Mobile Renderer
scale = 0.7

The same layout should therefore render correctly on different screen sizes.

23. MVP Scope

For the first implementation, focus on:

Hall

Hall name

Expected guests

Rectangle

Square

Circle

Custom Polygon

Tables

Round

Rectangle

Square

Capacity

Quantity

Designer

Grid

Snap to grid

Drag & Drop

Move

Resize

Rotate

Zoom

Pan

Collision detection

Undo / Redo

Save

Seats

Automatic seat generation based on table capacity

Seats move with table

Guests

Guest list

Drag guest to table

Automatic seat assignment

Manual seat reassignment

Later Enhancements

Do not implement these initially unless necessary:

Automatic seating optimization

Walking path calculation

Advanced route navigation

Complex decoration editor

Real-world meter/feet dimensions

Advanced CAD-like tools

24. Technical Requirements

Use:

React

TypeScript

React Konva

Konva

Zustand or another lightweight state-management solution

Existing project UI components/design system

Keep the Hall Designer state separate from general UI state.

The architecture should allow the layout editor to be reused later in:

Operations Admin

Guest Mobile App

Security App

Event Preview

Build this as a clean reusable feature, not as a one-off page.

The final experience should feel similar to a simplified Figma-style editor, but specifically designed for wedding/event hall seating layouts and simple enough for non-technical Operations Admin users.

## Development

This project uses **Next.js 16** with the App Router, TypeScript, Tailwind CSS, and next-intl (en/ar).

```sh
git clone <this-repository-url>
cd seat-designer-pro
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/en`.

### Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm run dev`   | Start development server |
| `pnpm run build` | Production build         |
| `pnpm run start` | Start production server  |
| `pnpm run lint`  | Run ESLint               |

See [`docs/architecture/`](docs/architecture/) for the project structure and coding rules.
