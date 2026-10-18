# Final polish SPEC (build step 12)

Status: **draft, not accepted** (2026-10-18). Written against branch `prod_v1` at `948aad6` (worktree `system-final-polish`). This is the last UI polish pass before release. Nothing here is built until the human accepts it. Every slice that needs a new dependency, a schema change or a new endpoint says so (CLAUDE.md sections 3 and 9).

## 1. Goal and rules

Make every list and pane look finished at every window size, cut repeated text, and move the staff Clearance workflow into the student record. Behavior and API rules stay the same, except for the two small API additions in F1 (`pageSize`) and F7 (`POST /sanctions`).

- **Design system rules (CLAUDE.md section 7) apply.** Tokens only, no raw hex. One component per pattern; a new look is a `cva` variant on the shared component, not a page-local class string. Every action ends in a toast that names the record; every destructive or notifying action goes through a modal.
- **Icons and tooltips for statuses.** A status that repeats what the tab, filter or heading already says becomes a small icon with a tooltip (`components/ui/IconHint.tsx`, fixed by F8 so it is never clipped). A text pill stays where the status is the main information on the row (case status, sanction status). Each slice lists the places it changes.
- **Rows keep their size.** No slice makes rows taller or shorter to fill space. Lists show more or fewer rows instead (F1).
- **Every rule is still enforced by the API.** Moving a screen (F6) does not move a rule into the client.
- **Out of scope:** new features beyond item 7, anything parked or removed in the spec (student statement, auto-clearance, in-person compliance), realtime updates.

## 2. Requests covered

| # | Request (from the human, 2026-10-18) | Slice |
|---|---|---|
| 1 | Some lists show a pager although the box still has room for more rows (student and staff). | F1 |
| 1.1 | Scrolling a right-hand detail pane cuts the card off at the top ("slices"). | F2 |
| 2 | Staff Cases list has a pager **and** scrolls. Suggest a better approach and apply it to every list like it. | F1 |
| 3 | Notices fill the full width like the Inbox; New and Edit notice become modals. | F3 |
| 4 | Staff template file row: no file type, no file size, no "Template file" label; View and Replace become icon buttons like the trash icon. | F4 |
| 5 | Staff sidebar: Students first, then Cases. | F5 |
| 6 | Remove the staff Clearance page; its full workflow (requirements, history, add requirement, term switch) opens inside the student record when the Clearance tile is clicked, without repeating the student's name. | F6 |
| 7 | "Add sanction" on staff Sanction templates. | F7 |
| 8 | Student Violations / Sanctions: the tooltip is clipped by its container. | F8 |
| 9 | Student appointment card: the appointment code and date replace the "Scheduled" pill; the bottom code line is removed. No status is shown. | F9 |
| 10 | Notification bell (and Inbox) rows: centre the icon vertically. | F10 |
| 11 | Student Clearance: remove the "N remaining" and "N completed" pills. | F11 |
| 12 | Student handbook template block: drop the repeated sanction name, file extension and size; move the posted date; replace "What to prepare" with a better design (a note icon). | F12 |
| Note | Use tooltips and icons for statuses where it helps. | Section 1, per slice |

Decisions taken with the human in this session:

- **D1 (item 2).** Lists fit their rows to the box (F1), with an unchanged row size: no inner scrollbar on desktop, and the pager only when rows overflow.
- **D2 (item 9).** The card shows code and date only, with no status (the Upcoming / History tab already says it).
- **D3 (item 12).** The instructions sit behind a note icon that opens a small popover; no permanent "What to prepare" block.
- **D4 (item 3).** A notice opens in a read-only modal with Edit and Remove; Edit switches to the form modal.

## 3. Findings (what the code does today)

| # | Finding | Evidence |
|---|---|---|
| A1 | Page sizes are fixed numbers that ignore the height of the box. A tall window shows a pager with empty space under the rows; a short one overflows. | Client: `utils/inbox.ts:6` (6), `utils/handbook.ts:7` (6), `pages/student/violations/ViolationTable.tsx:11` (5). API: `repositories/cases/queries.ts:10` (6), `repositories/appointments/queries.ts:5` (5), `controllers/students.controller.ts:9` (20), `repositories/clearance/queries.ts:27` (20) |
| A2 | Grouped Cases ("All" queue) adds a group head per status on top of 6 rows of at least 72 px, under a two-row filter header, so the body overflows at a 768 px window: pager and scrollbar at once. | `pages/staff/Cases.tsx:156-212` |
| A3 | Rows use `min-h-*`, so their height depends on the content and cannot be counted exactly. | e.g. `Cases.tsx` row `min-h-[72px]`, `Notices.tsx` row `min-h-[72px]` |
| A4 | On desktop the whole detail pane scrolls (`overflow-y-auto` on the pane wrapper), so the card's top border, rounded corners and header scroll away and the content is cut at the pane edge. | `components/layout/MasterDetail.tsx:68` |
| A5 | The tooltip is `position: absolute` inside its row; any card with `overflow-hidden` or a scroll body clips it. The portal helper already exists; the UI zoom must be accounted for when positioning. | `components/ui/IconHint.tsx`, `components/feedback/inBody.tsx`, `hooks/useUiZoom.ts` |
| A6 | Bell rows align the icon to the top. | `components/layout/BellPopover.tsx:23` (`items-start`) |
| A7 | Sanctions cannot be created: the templates API only saves text and files, and the handbook API only creates handbook entries. The `sanctions` table already has `sanction_type` (unique) and `description`; **no schema change is needed.** | `api/src/routes/templates.routes.ts:24-26`, `api/prisma/schema.prisma:331` |
| A8 | Clearance is linked from many places. `/clearance` is one route shared by both roles through `RoleSwitch`, so the student page must keep it. | `routes/AppRoutes.tsx:24-25,40,72-73`, `utils/nav.ts:47,71`, `pages/staff/Dashboard.tsx:243`, `utils/staffDashboard.ts:111`, `pages/staff/students/StudentRecordPane.tsx:190`, `utils/inbox.ts:126` |
| A9 | The student record already loads the student's clearance for the current term for its tile; the Clearance tile navigates away instead of opening a tab. | `StudentRecordPane.tsx:139-146,184-191` |
| A10 | The student template block repeats the sanction name as an uppercase label, shows "PDF · 154.9 KB · Posted …" and a permanent "What to prepare" block. | `pages/student/handbook/HandbookEntry.tsx:33-60` |

## 4. Slices

Each slice is one task (CLAUDE.md section 3): tests first for logic, then `npm test`, `npm run lint`, `npm run typecheck` and `npm run build`. Screens are checked at three widths (under 720, 720 to 1100, over 1100).

### F1. Lists fit their rows to the box (items 1 and 2)

**Approach.** The list measures its own body and shows exactly as many rows as fit, so it never scrolls inside the card on desktop and only shows the pager when there are more rows than fit. Row heights do not change.

1. **Fixed row heights.** Every paginated list row changes from `min-h-*` to a fixed `h-*` with truncated text, at today's minimum height (72 px for Cases, Notices, Students, Appointments; the measured current height for Inbox, Handbook, student Violations and Sanctions). One constant per list, exported next to the component. Group heads (`components/ui/GroupHead.tsx`) also get a fixed height.
2. **Pure math in `utils/pager.ts`:** `fitRows(bodyHeight, rowHeight, reserved = 0)` returns `floor((bodyHeight − reserved) / rowHeight)`, clamped to 3–50, plus a test. Reuse the existing `pageCount`, `clampPage` and `pageHolding`.
3. **Hook `hooks/useFitRows.ts`:** a `ResizeObserver` on the list body that returns the row count, debounced so a window resize does not refetch on every frame. Below the 800 px master-detail breakpoint (stacked layout, the page itself scrolls) it returns a fixed 10.
4. **Server-paginated lists** (staff Cases, Appointments, Students, and the clearance roster used by F6) send `pageSize`. The API accepts an optional `pageSize` query parameter, validated at the route boundary and clamped to 3–50; when it is missing the current default applies, so old clients are unchanged. A route test per endpoint covers the default, the clamp and an invalid value. When the size changes, the list keeps the selected record's page (`focus` already does this for Cases).
5. **Grouped Cases.** Each status group starting on the page takes one group-head height from the space. The API returns the rows; the client reserves `groupHeadHeight × (number of status groups in statusCounts that are non-empty, at most the rows shown)` before asking. If a page still overflows by one group head (rare), the body scrolls by that one row rather than hiding data.
6. **Client-paginated lists** (Inbox, student Handbook, student Violations, student Sanctions, staff Sanction templates, staff Violations) slice locally with the measured count.
7. **Dashboard cards** (staff and student): show the first N rows that fit, using the same `fitRows`; the "View all" link stays. No empty block is left under the rows.

Applies to: `pages/staff/Cases.tsx`, `pages/staff/appointments/AppointmentList.tsx`, `pages/staff/students/StudentList.tsx`, `pages/shared/Inbox.tsx`, `pages/student/handbook/HandbookTable.tsx`, `pages/student/violations/ViolationTable.tsx`, `pages/student/sanctions/SanctionTable.tsx`, `pages/staff/templates/TemplateList.tsx`, `pages/staff/handbook/ViolationList.tsx`, `components/dashboard/DashboardCards.tsx`.

Done when, at a 1366×768 window and a 1920×1080 window: no list shows both a pager and a scrollbar; no list shows a pager while it has room for at least one more row; rows are the same height as before.

### F2. Detail panes keep their frame when scrolled (item 1.1)

`MasterDetail` stops scrolling the pane wrapper on desktop (it keeps the `h-[var(--page-h)]` height). Each detail card becomes `flex h-full flex-col overflow-hidden` with a fixed header (title, status, stage tracker where present) and one inner `min-h-0 flex-1 overflow-y-auto` body; action footers (`components/ui/ActionFooter.tsx`) stay pinned below the body. The rounded border is then always visible and content scrolls inside it, the same way the list cards already work.

Applies to every detail pane: `TemplateEditor`, `CaseDetail`, `StudentRecordPane`, `AppointmentPane`, student `SanctionDetail`, `ViolationDetail`, `HandbookEntry`, `ViolationEditor`. Below 800 px nothing changes (the page scrolls).

Done when no detail pane shows content cut at the top edge while scrolling at any width over 800 px.

### F3. Notices: full width, modals (item 3)

- `pages/staff/Notices.tsx` drops `MasterDetail` and becomes one full-width card like the Inbox (`Inbox.tsx:105`), with "New notice" in its header.
- **Rows:** a campaign icon, title, meta line (published date, visible until) and the state as an icon with a tooltip (Active, Scheduled, Ended), at a fixed row height (F1 applies).
- **View:** clicking a row opens a read-only modal (`components/feedback/Dialog.tsx`) with Published, Visible until, Sent to and Message, and Edit and Remove notice buttons.
- **Edit and New:** `NoticeForm` renders inside `components/feedback/FormModal.tsx`, with the same fields, validation (`validators/notice.ts`) and copy as today. The modal follows the existing FormModal look (title, close button, footer buttons, locked while saving). Edit replaces the view modal; Cancel returns to it.
- **Remove:** unchanged `ConfirmModal`.
- **Toasts:** unchanged ("<title> published.", and so on).
- **Phone:** the list is the screen; the modals open as bottom sheets as all modals do today.

### F4. Staff template file row (item 4)

- `components/ui/FileRow.tsx` gets a `cva` variant `actions: 'pill' | 'icon'` (default `pill`, so proof files are unchanged).
- The `icon` variant shows View (`visibility`), Replace (`swap_horiz`) and Remove (`delete`) as the same round 40 px icon buttons the trash icon uses, each with an accessible name and a tooltip.
- In `pages/staff/templates/TemplateEditor.tsx`:
  - The "Template file" label is removed.
  - The meta line shows only "Posted Oct 16, 2026" (no type, no size). `utils/files.ts` gets a `postedOn(file)` helper with a test.
  - The three icons sit on the right of the row on one line; the file name wraps to two lines at most.
  - The class-override string on the `FileRow` call is removed.

### F5. Staff sidebar order (item 5)

`utils/nav.ts` staff "Manage" group becomes: Students, Cases, Notices, Appointments. Badges stay on their entries. Clearance is removed by F6. The phone tab bar and `MoreSheet` read the same list; check that their first entries still make sense (Home, Inbox, Students, Cases, More).

### F6. Clearance inside the student record (item 6)

- **Remove:** `pages/staff/Clearance.tsx`, `pages/staff/clearance/StudentRoster.tsx`, the staff nav entry, and the staff branch of the `/clearance` route.
- **Move:** `ClearancePane` and `Requirements` move to `components/clearance/` as `StudentClearance.tsx` and `Requirements.tsx`. The student's name and the header are removed (the record above already shows them). It keeps:
  - the term chips, which move here from the old page header;
  - the In progress / Cleared status pill;
  - the Requirements / Activity history tabs;
  - record completion, reverse, remove requirement, Add requirement and Set up clearance, with the same API calls, modals and toasts.
- **Record pane:** in `StudentRecordPane.tsx` the Clearance tile becomes a normal tab (`clr`). When it is selected, the clearance section renders below the tiles, in place of the case or sanction list. The tab and term live in the URL (`/students/:id?tab=clr&term=2026-1`) so links and the back gesture work. `utils/studentRecord.ts` (`RecordTab`) gains `clr`, with a test.
- **Redirects** (staff only): `/clearance` goes to `/students`, and `/clearance/:id?term=…` goes to `/students/:id?tab=clr&term=…`. The student `/clearance` page is untouched.
- **Links:**
  - The staff dashboard "Clearance work" card links to `/students`.
  - The rows in `utils/staffDashboard.ts` link to the new address.
  - The Inbox action label stays "Open clearance", and `utils/inbox.ts` matches the new href.
- **API:** no change.

### F7. Add sanction (item 7)

- **API:** new endpoint `POST /sanctions` (staff only).
  - Body: `{ sanctionType: string, description: string }`, trimmed, 1–80 and 1–500 characters.
  - A duplicate name (case-insensitive) is refused with `409` and "A sanction with that name already exists."
  - Returns the new sanction as `SanctionTemplateView` (no files, no requirements yet).
  - Built in the usual layers: a validator, a repository function (memory fake and Prisma), a service, a route registered in `routes/index.ts`, and route tests (validation, 409, student refused). No schema change (A7).
- **Client:**
  - `templatesApi.createSanction()`.
  - In the `TemplateList` header, an "Add sanction" button opens a `FormModal` with Name and Description and the usual inline validation plus top alert.
  - On success: toast "<name> added.", the list reloads, and the new sanction is selected so staff can upload its template next.
  - The display code `S-0xx` stays derived (SPEC decision 13).
- **SPEC CHANGE (human):** add `POST /sanctions` to the API sketch (SPEC 7) and note that staff may add sanctions from Sanction templates.

### F8. Tooltips are never clipped (item 8)

- `IconHint` renders its tooltip through `inBody` with `position: fixed`. The position comes from the button's `getBoundingClientRect()`, corrected for the UI zoom.
- It sits above the icon, flips below when there is no room above, and is kept 8 px inside the window edges.
- Hover, focus, tap and Escape behave as today.
- One shared helper `utils/anchor.ts` (pure, tested) does the placement math so F12's popover reuses it.
- Fixes every `IconHint` use, including the proof heading in `components/sanctions/ProofPanel.tsx`.

### F9. Student appointment card (item 9)

In `pages/student/Appointments.tsx`:

- The top-right status pill is replaced by the appointment code and date, for example `A-002 · Oct 17, 2026` (code, then the last-updated date), in the muted meta style.
- The bottom line (`{code} · Updated {date}`, line 68) is removed.
- No status is shown on the card; the Upcoming / History tabs already carry it.

### F10. Bell and Inbox rows (item 10)

The row icon is centred vertically: `items-start` becomes `items-center` in `components/layout/BellPopover.tsx:23`, and the matching Inbox row in `pages/shared/Inbox.tsx` is checked and aligned the same way. Applies to both roles.

### F11. Student clearance overview (item 11)

Remove the "N remaining" and "N completed" pills (`pages/student/Clearance.tsx:87-88`). The status heading and progress bar stay.

### F12. Student handbook template block (item 12)

In `pages/student/handbook/HandbookEntry.tsx` (`PostedTemplate`):

- **Remove:**
  - the uppercase sanction label above the file (the title already names it);
  - the file type and size;
  - the permanent "What to prepare" block.
- **Posted date:** moves to a muted line under the description ("Posted Oct 16, 2026", the `postedOn` helper from F4).
- **Instructions:**
  - A note icon button (`sticky_note_2`, accessible name "Instructions from the SDO") goes in the "Template and requirements" header.
  - Clicking or tapping it opens a small popover with the heading "Instructions from the SDO" and the text staff wrote.
  - It closes on Escape, on a click outside and on a second click.
  - The icon is shown only when at least one posted template has instructions. With more than one template, each template row gets its own note icon beside its title instead of the header.
  - The popover is a new shared component `components/ui/Popover.tsx`, placed with `utils/anchor.ts` from F8 and rendered through `inBody`. It gets an interaction test (keyboard open and close, focus returns to the button).
- **Buttons:** View template and Download stay.

## 5. Order and checkpoints

1. F8 (placement helper, needed by F12), F10, F11, F5: small and independent.
2. F4, F9, F12.
3. F2, then F1 (API `pageSize` plus client), then F3 (needs F1 row heights).
4. F6, then F7 (new endpoint).

- **Hot files:** `utils/nav.ts`, `routes/AppRoutes.tsx`, `shared/types.ts`, `routes/index.ts`. F5 and F6 both touch `nav.ts`: F5 first.
- **No dependency** and **no schema change**.
- **SPEC CHANGE notes for the human:** the API sketch gets `POST /sanctions` and the optional `pageSize` parameter; the screens section drops the staff Clearance page and adds the Clearance tab of the student record.

## 6. Verification

- Per slice and at the end: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
- **Unit tests:** `fitRows`, the anchor placement, `postedOn`, and the `RecordTab` parsing with `clr`.
- **Route tests:** `pageSize` default, clamp and invalid value on each list endpoint; `POST /sanctions` validation, duplicate (409) and staff only.
- **Interaction tests:** `IconHint` (portal, flip, Escape), `Popover`, `FileRow` icon variant (names, keyboard), and the Notices modals (open, edit, cancel back to view).
- **Playwright** at under 720, 720 to 1100 and over 1100 px, for every screen in section 2. Check:
  - there is no pager while rows still fit;
  - there is never a pager and an inner scrollbar at once;
  - no detail pane slices;
  - tooltips are not clipped;
  - the staff sidebar order is right;
  - `/clearance/:id` redirects for staff and still works for students.
- **HUMAN CHECK** (dev database):
  - Sign in as staff, open Sanction templates, choose Add sanction, enter a new name -> it appears in the list with the next `S-0xx` code and can take a template upload.
  - Open a student, click the Clearance tile, record a requirement -> the student's bell shows "Clearance requirement done".
