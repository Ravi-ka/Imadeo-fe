# Imadeo Frontend Code Audit

**Date:** 2026-09-17  
**Auditor:** Cursor Cloud Agent  
**Kind:** Read-only product/engineering audit (no behavior changes)

## Snapshot

| Ref | SHA | What it is |
| --- | --- | --- |
| `main` | `43ccc46` | LICENSE + `.gitignore` only. **Not a runnable app.** |
| `dev` | `94d3648` | Integration branch; this PR targets it. Working DAM on Media Assets. |
| `feat/pr-review` ([PR #1](https://github.com/Ravi-ka/Imadeo-fe/pull/1)) | `09ca440` | 2 commits ahead of `dev`: auth config hardening, error/empty UX, Coming Soon stubs for unfinished pages. |

Primary evidence is from **`dev` @ `94d3648`**, with an explicit **“PR #1 already addresses this”** tag where the open hardening PR changes the finding. Findings that exist only on `dev` (and are fixed in PR #1) are labeled **`dev-only`**.

No automated tests exist in any branch (`package.json` has `dev` / `build` / `lint` / `typecheck` only; no `*.test.*`, Playwright, or Jest).

---

## Summary

Imadeo-fe is a Next.js 15 App Router DAM (digital asset management) client. Clerk authenticates users; a backend at `NEXT_PUBLIC_API_URL` owns workspaces, folders, and assets. React Query loads lists; Zustand holds theme, upload-modal state, and a persisted Imadeo handle.

**What actually works today:** sign-in/sign-up, Imadeo ID bootstrap, folder tree (create / rename / move / delete, max depth 3), asset upload via presign + complete, grid/list browse with infinite scroll and search, favorite toggle, download URL, asset move, viewer-role gating on some write actions.

**What the chrome implies but does not deliver:** sharing, tags, descriptions, image conversion, analytics, integrations, settings, notifications, help, upgrades, pricing checkout, folder upload, and a real overview dashboard.

The highest-risk issues are **fake share URLs**, **workspace/tenant identity that the UI parses two different ways**, and **post-login landing on an unfinished Overview**. Several controls look clickable and succeed in the toast layer while doing nothing useful (or something wrong).

```text
Public
  /                         marketing (Navbar + Footer)
  /login, /register         Clerk SignIn / SignUp
Protected (middleware `/dashboard(.*)`)
  /dashboard                → redirect /dashboard/overview
  /dashboard/overview       stub/mock dashboard (Coming Soon in PR #1)
  /dashboard/media-assets   the real product
  /dashboard/favorites      favorites-only list; drawer actions mostly no-ops
  /dashboard/{image-converter,usage-analytics,integrations,settings}
                            incomplete or Coming Soon
```

**Stack:** Next 15, React 19, Clerk, TanStack Query, Zustand, Tailwind, Sonner, Framer Motion. Fetch wrappers in `services/*` (plus a leftover Axios client on `dev`).

---

## Bugs

Each item: what breaks, where, how to reproduce, severity, confidence.

### B1. Share copies a fabricated URL

- **What breaks:** “Share” looks successful and copies a link that is not a real asset share. Recipients get a dead URL. This is a trust/security defect, not just a stub.
- **Where:** `app/dashboard/media-assets/page.tsx` (`handleShareAsset`).
- **Evidence:**

```ts
navigator.clipboard.writeText(`https://imadeo.io/share/${Date.now()}`);
toast.success(`Share link copied for "${itemName}"`);
```

- **Repro:** Media Assets → open an asset → Share (or list-view Share). Paste the clipboard. Domain/path are invented; `Date.now()` is not an asset id.
- **Severity:** **Critical** (users will distribute bogus links; marketing copy promises “secure file sharing”).
- **Confidence:** **High**
- **Notes:** Favorites page disables share (`shareDisabled` / `comingSoonActions`), so the lie is specific to Media Assets. There is no share API in `services/assetService.ts`.

### B2. Workspace list and storage metrics cannot both be correct

- **What breaks:** Storage widget and/or workspace switcher are fed incompatible shapes from the same query.
- **Where:** `services/workspaceService.ts` (`getWorkspacesApi` returns `res.workspaces || res`, typed `Workspace[]`); `app/dashboard/media-assets/page.tsx` and `components/dam/Sidebar.tsx` then read `(workspaces as any)?.memberships`.
- **Evidence:**
  - Switcher only renders when `Array.isArray(workspaces) && workspaces.length > 0`.
  - Storage uses `workspaces.memberships` / `workspacesData.memberships`.
  - Arrays do not have `.memberships`. If the API is `{ memberships: [...] }` with no `workspaces` key, `getWorkspacesApi` returns that object, `Array.isArray` is false, and the switcher never appears.
- **Repro:** Open Media Assets and Sidebar. Observe: switcher XOR storage, or both empty. Compare network payload of `GET /api/workspaces/me` to the two parsers.
- **Severity:** **High** (wrong quota, hidden workspaces, or a silent 0 B).
- **Confidence:** **High** (logic contradiction in-repo; exact production symptom depends on API JSON).
- **Guess (labeled):** Backend likely returns `{ memberships: [{ tenant, role, ... }] }`. That would explain always-zero storage on an array parse *or* a missing switcher on an object parse.

### B3. Default tenant id is the Imadeo *handle*, not necessarily the workspace id

- **What breaks:** Every asset/folder call sends `X-Tenant-Id: <imadeoId or ?ws=>`. After ID creation the client uses the handle. The switcher, when it works, uses `workspace.id`. If those differ, the default library is empty or hits the wrong tenant until the user switches (and switching is easy to lose — see B4).
- **Where:** `app/dashboard/layout.tsx`, `app/dashboard/media-assets/page.tsx`, `app/dashboard/favorites/page.tsx`: `activeTenantId = searchParams.get('ws') || imadeoId || ''`.
- **Repro:** Create Imadeo ID `@alice`. Inspect `X-Tenant-Id` on `/api/assets`. Switch workspace if the switcher shows a UUID. Compare ids.
- **Severity:** **High** if handle ≠ workspace id (empty DAM / cross-tenant confusion). **Low** if the API treats handle as tenant id.
- **Confidence:** **Medium** (needs API contract). Worth confirming before any “empty library” support tickets.

### B4. Sidebar and Favorites links drop `?ws=`

- **What breaks:** Workspace context is URL state on Media Assets (`?ws=` + `?folder=`). Sidebar `Link`s are bare paths (`/dashboard/overview`, `/dashboard/media-assets`, …). Favorites empty-state goes to `/dashboard/media-assets` with no query. User returns to the personal handle (B3) or root, not the workspace they were in.
- **Where:** `components/dam/Sidebar.tsx` `navItems`; `app/dashboard/favorites/page.tsx` browse link.
- **Repro:** Media Assets `?ws=<other>` → click Overview or Favorites → click Media Assets. Query is gone. Workspace switcher uses `window.location.href = \`?ws=${wsId}\`` (full reload, folder query discarded).
- **Severity:** **High** for multi-workspace; **Medium** if every user has one tenant.
- **Confidence:** **High**

### B5. `dev-only` — Imadeo ID check failure is treated as “you have no ID”

- **What breaks:** A 5xx/network/401 on `GET /api/dashboard/get-imadeo-id` opens **Create Your Imadeo ID**. Existing users can try to mint a second handle, or get stuck behind a blocking modal with no retry/sign-out path from the overlay.
- **Where (`dev`):** `app/dashboard/layout.tsx` catch path: `setImadeoId(null); setShowCreateImadeoModal(true)`. Token is `getToken()` with no JWT template.
- **Repro on `dev`:** Block `api-dev.imadeo.in` or return 500 from get-imadeo-id; open `/dashboard`.
- **Severity:** **High**
- **Confidence:** **High**
- **PR #1:** Retry overlay + optional “Set up Imadeo ID”; `getApiToken()` + fail-closed production env; persisted tenant cleared on account switch/sign-out. **Still open:** first-run modal has no Sign out; Escape does nothing unless `onCancel` is passed.

### B6. `dev-only` — leftover Axios client + tokens in `localStorage`

- **What breaks:** `services/api.ts` defaults to `http://172.30.7.78:5000` (or `NEXT_PUBLIC_API_URL`). `store/useAuthStore.ts` reads/writes `imadeo_token` and `imadeo_user`. Clerk is the real auth path, but this is XSS-exfiltrable session material if anything still calls `api` / `login()`.
- **Where:** `services/api.ts`, `store/useAuthStore.ts` (also exports `useUIStore` from the same auth module — `app/layout.tsx` imports theme from `@/store/useAuthStore` on `dev`).
- **Severity:** **High** if the Axios instance is reachable; **Medium** as dead but loaded attack surface.
- **Confidence:** **Medium** (`api` / `useAuthStore.login` look unused by pages; still shipped).
- **PR #1:** Deletes `api.ts` / `useAuthStore`; theme lives in `store/useUIStore.ts`. Clerk tokens stay in Clerk storage.

### B7. Asset rename is implemented but unreachable

- **What breaks:** `useRenameAsset` and `handleRenameAsset` exist. The drawer rename field renders only when `isEditingDescription` is true. That flag is never set to true: the description/edit UI is commented out. Grid cards have no rename action (`MoreVertical` is imported in `AssetGrid` and unused). Users cannot rename from the UI.
- **Where:** `components/dam/AssetDetailsDrawer.tsx` (rename gated on `isEditingDescription`); `components/dam/AssetGrid.tsx`.
- **Repro:** Open any asset inspector. There is no rename control. Grid overflow menu does not exist.
- **Severity:** **High** (lost advertised capability).
- **Confidence:** **High**

### B8. Video “play” in the inspector does not play

- **What breaks:** Play/Pause toggles `isPlayingVideo` and the icon only. Remote videos render as `<img src={thumbnail}>`. Blob videos never call `.play()` / `.pause()`.
- **Where:** `components/dam/AssetDetailsDrawer.tsx`.
- **Repro:** Upload an MP4, open inspector, click the play overlay.
- **Severity:** **Medium**
- **Confidence:** **High**

### B9. Upload copy, limits, and “Upload Folder” disagree with the code

- **What breaks:**
  1. Dropzone says “up to **500MB**”; `handleUpload` rejects `size > 104857600` (**100MB**).
  2. Copy lists **FIG**; `ALLOWED_MIME_TYPES` has no Figma type (and empty `file.type` becomes `application/octet-stream`, also rejected).
  3. Header dropdown **Upload Folder** calls the same `onOpenUpload()` as **Upload Files**. Single-file input; no `webkitdirectory`.
- **Where:** `components/dam/UploadModal.tsx`; `components/dam/Header.tsx`.
- **Repro:** Pick a 150MB MP4 → error vs 500MB hint. Click Upload Folder → same single-file modal.
- **Severity:** **Medium**
- **Confidence:** **High**

### B10. Duplicate error toasts on mutations

- **What breaks:** `services/queryClient.tsx` `MutationCache.onError` already `toast.error`s. Pages also catch and toast (`delete`, `rename`, `favorite`, `folder` CRUD, upload). Users see two identical errors.
- **Where:** `services/queryClient.tsx`; `app/dashboard/media-assets/page.tsx`; `components/dam/UploadModal.tsx`.
- **Repro:** Delete an asset with API 500.
- **Severity:** **Medium**
- **Confidence:** **High**

### B11. Favorite success toast fires before the server agrees

- **What breaks:** Optimistic cache + `toast.success` run *then* `await toggleFavourite()`. Failures add a second toast and roll back. Rapid clicks can race POST/DELETE `/favourite`.
- **Where:** `handleToggleFavorite` in `media-assets/page.tsx` and `favorites/page.tsx`.
- **Repro:** Toggle favorite with network offline (or throttle). Green then red toast; star flickers.
- **Severity:** **Medium**
- **Confidence:** **High**

### B12. `fetch` helpers assume JSON bodies

- **What breaks:** `assetsFetch` / `foldersFetch` / `workspaceFetch` always `await res.json()`. Empty 204 (typical DELETE) or HTML/nginx error pages throw `SyntaxError` instead of the API error. Callers show “Request failed” / raw parse errors.
- **Where:** `services/assetService.ts`, `services/folderService.ts`, `services/workspaceService.ts`.
- **Repro:** If `DELETE /api/assets/:id` returns 204 No Content, UI treats success as failure (or vice versa if thrown after a 2xx).
- **Severity:** **Medium** (depends on backend).
- **Confidence:** **Medium**

### B13. Thumbnail poll can miss the asset

- **What breaks:** `getAssetByIdApi` on 404/405/400 falls back to `getAssetsApi(..., { status: 'READY' }, 20)` and `.find(id)`. New uploads may not be in the first 20 READY items. Polling then gives up after ~12.5s (`THUMBNAIL_POLL_DELAYS_MS`) and leaves a local blob or a blank thumb.
- **Where:** `services/assetService.ts` `getAssetByIdApi`, `pollAssetUntilThumbnails`.
- **Severity:** **Medium**
- **Confidence:** **Medium**

### B14. “Last modified” sort uses `createdAt`

- **What breaks:** Sort option `updatedAt` (“Last modified”) sorts by `new Date(b.createdAt)`. Renames/moves do not reorder.
- **Where:** `app/dashboard/media-assets/page.tsx` and `app/dashboard/favorites/page.tsx` `filteredAssets`.
- **Severity:** **Low**
- **Confidence:** **High**

### B15. `/` search shortcut steals keys from other fields

- **What breaks:** Header listens for `e.key === '/'` unless focus is already on the two search inputs. Typing `/` in folder rename, Imadeo ID, create-folder, Clerk-unrelated inputs, or textarea is prevented and search focuses.
- **Where:** `components/dam/Header.tsx`.
- **Repro:** Rename a folder, type `brand/2026`.
- **Severity:** **Medium**
- **Confidence:** **High**

### B16. Start Upload is enabled with no file

- **What breaks:** Footer button is `disabled={isUploading}` only. Click with no selection no-ops (`if (!selectedFile) return`) with no message.
- **Where:** `components/dam/UploadModal.tsx`.
- **Severity:** **Low**
- **Confidence:** **High**

### B17. Root layout is a Client Component; theme flashes

- **What breaks:** `app/layout.tsx` is `'use client'`. No `metadata` export; title is a manual `<head>`. Zustand default theme is `'dark'`; `localStorage` / `prefers-color-scheme` apply in `useEffect` after paint → light-mode users flash dark. No blocking theme script.
- **Where:** `app/layout.tsx`, `store/useUIStore.ts` (`dev`: `useAuthStore.ts`).
- **Severity:** **Low** (UX/SEO); **Medium** if you care about Lighthouse/OG.
- **Confidence:** **High**

### B18. Hardcoded owner identity on every asset

- **What breaks:** Mapper always sets owner name `System User`, email `user@imadeo.io`, Unsplash avatar. Inspector owner block is commented out, so this is latent; if re-enabled it is wrong and loads a third-party photo.
- **Where:** `services/assetService.ts` `mapBackendAssetToFrontend`.
- **Severity:** **Low** (latent PII/brand leak if uncommented).
- **Confidence:** **High**

### B19. `dev-only` — production API fallbacks

- **What breaks:** On `dev`, `workspaceService` / other modules fall back to `https://api-dev.imadeo.in` or Axios `172.30.7.78:5000` when env is missing. Easy to hit the wrong environment.
- **PR #1:** `getApiBaseUrl()` throws in production if unset; local fallback is `http://localhost:8000`.
- **Severity:** **Medium** on `dev` branch deploys.
- **Confidence:** **High**

### B20. Engine pin `node >= 24.19.0` (PR #1)

- **What breaks:** Contributors and many CI images will fail `npm install` / engines check. Unrelated to runtime bugs but will block builds.
- **Where (PR #1):** `package.json` `engines`.
- **Severity:** **Medium** for DX/CI.
- **Confidence:** **High** if that PR merges as-is.

---

## Flow gaps

Incomplete journeys, missing states, dead ends. Not all are “bugs” if the page is honestly unfinished; they *are* gaps because the IA still sends people there.

### F1. First authenticated screen is not the product

- `/dashboard` redirects to `/dashboard/overview`.
- **On `dev`:** Overview is a welcome mock (upload from a page that is not the library, search in header does nothing, stats are not wired to `useAssets` / workspaces). Easy to think the DAM is empty or fake.
- **On PR #1:** Overview is Coming Soon with a button to Media Assets — honest, but **every login still lands here**. Clerk `AFTER_SIGN_IN_URL=/dashboard`.
- Landing hero CTA is “Explore DAM Dashboard” → `/dashboard/overview` (unauthenticated users hit Clerk, then the stub).

**Fix direction:** Redirect `/dashboard` → `/dashboard/media-assets`. Hero CTA: signed-out → `/register` or `/login`; signed-in → Media Assets.

### F2. Sidebar is mostly unfinished product

| Nav item | `dev` | PR #1 |
| --- | --- | --- |
| Overview | Mock welcome | Coming Soon |
| Media Assets | Real | Real |
| Image Converter | Page exists; not a converter | Coming Soon |
| Usage & Analytics | Page exists; not analytics | Coming Soon |
| Integrations | Page exists; not integrations | Coming Soon |
| Settings | Page exists; not settings | Coming Soon |

Account menu **Account Profile** → `/dashboard/settings`. Clerk `openUserProfile` is imported in `Sidebar` and never called. Settings copy on PR #1 even tells users to use the profile menu — which points back at Settings.

**Notifications** (permanent unread badge) and **Help** are non-functional. **Upgrade** is a non-button. Coming Soon headers still show search that no-ops.

### F3. Favorites is a second, weaker DAM

- Own route `/dashboard/favorites` **and** a Favorites tab on Media Assets (workspace-wide, not folder-scoped — copy does explain this).
- Drawer: `onDeleteAsset` / `onRenameAsset` / `onDownloadAsset` / `onShare` are empty async functions; `comingSoonActions` disables them. User can favorite/unfavorite only.
- Empty state → Media Assets without `ws`.
- No `isViewer` (Header `isViewer={false}`) even if the workspace role is VIEWER.

### F4. Sharing, tags, and description are façade

- Share: fake URL (B1) or disabled.
- Tags defaulted to `['Brand', 'Imadeo', '2026']` then overwritten from `asset.tags` (always `[]` from mapper). Tag UI commented out.
- Description edit commented out; `isEditingDescription` still blocks rename (B7).
- Path copy UI commented out; `path` is a fake `/Root/${name}`.

### F5. Failed / processing assets disappear

- Lists always send `status: 'READY'`. `FAILED` / stuck `UPLOADING` never appear. No retry. Upload errors only live in the modal. Users cannot clean up failed rows.

### F6. Onboarding / billing / legal dead ends

- Marketing **Architecture** nav → `#architecture` (no section).
- Pricing CTAs (including “Contact Sales”) all `Link` to `/register`. No Stripe/plan API.
- Footer Product/Resources/Legal → `#` except Features/Pricing.
- Social icons go to github.com / twitter.com / linkedin.com homepages, not Imadeo properties.
- Create Imadeo ID is blocking and mandatory (reasonable) but has no “sign out” if the user refuses a handle.

### F7. Folder UX gaps

- Empty folder tree + `?folder=` missing node: effect navigates to root (good). Combined with `placeholderData: []`, a slow refetch after tenant change can theoretically bounce; guarded by `isLoadingTree`.
- Folder cards: single click opens (easy to miss the hover rename/delete).
- Delete folder is recursive and permanent — copy is clear; no “move contents out” option.
- Breadcrumbs in **Header** (`Home / Media Assets`) are not links; real folder breadcrumbs are a second component.

### F8. Accessibility (baseline)

- Many icon-only controls lack `aria-label` (favorite, share, collapse, notifications). ThemeToggle is a good exception.
- Modals: no focus trap, no `role="dialog"` / `aria-modal`, limited Escape (Imadeo ID Escape only with `onCancel`).
- FAQ accordion: no `aria-expanded`.
- Login/register: decorative “SYSTEM STATUS: OK / LATENCY: 12ms” is not live status.
- Grid cards are clickable `div`s, not buttons; no keyboard open.

### F9. Viewer role is partial

- Upload / folder create hidden when `role === 'VIEWER'`.
- Role is derived from `workspaces.find(ws => ws.id === activeTenantId)` which fails if `workspaces` is not an array of `{ id }` (B2). Default is not viewer → VIEWER users may still see write UI.

### F10. Signed-in users can still open `/login` and `/register`

Middleware only protects `/dashboard`. No redirect away from Clerk screens when already authenticated.

---

## Feature suggestions

Grounded in code that already exists; not a generic backlog.

### P1. Make Media Assets the home, Overview a real summary later

Redirect `/dashboard` → `/dashboard/media-assets`. When Overview is rebuilt, use data you already fetch: `totalAssetsCount`, `countByAssetType`, folder tree size, `storageUsed` (once B2 is fixed), and a “recent” query (`sort` / `take` without `root: true`). `StatsOverview` is unused and currently hardcodes **64.2 GB / 100 GB** — do not wire it until those numbers are real.

### P2. One tenant model, preserved in the URL

- Normalize `GET /api/workspaces/me` once (`id`, `name`, `role`, `storageUsed`, `storageQuota`, `plan`).
- Default `?ws=` to the membership whose tenant matches the Imadeo user (or the only membership).
- Sidebar/Header/Favorites `Link`s keep `ws` (and `folder` when still in the library).
- Stop using the public handle as `X-Tenant-Id` unless the API contract says so.

### P3. Honest sharing, or hide it

Until a share API exists: disable Share everywhere (Favorites already does). When you add it: create a tokenized link, expiry, and copy the **download or viewer URL** you already have (`getAssetDownloadUrlApi`) as a v1 if public share is not ready — but label it “download link, expires in N seconds”, not “share”.

### P4. Inspector that can actually act

Reuse Media Assets handlers on Favorites (delete, rename, download, move). Expose rename in the drawer (uncomment a dedicated control; do not overload `isEditingDescription`). Grid: a real overflow menu (the icons are already imported). Video: `<video controls>` for playable mime types.

### P5. Upload that matches the label

Either implement folder upload (`webkitdirectory` + relative paths + `folderId` create) or remove the dropdown item. Align 100MB vs 500MB with the backend. Show allowed types from `ALLOWED_MIME_TYPES`. Disable Start Upload with no file. Surface `FAILED` assets with retry (complete or delete).

### P6. Clerk profile instead of a fake Settings page

`openUserProfile()` is already in the Sidebar. Point “Account Profile” at it. Keep Settings Coming Soon for billing/workspace — or hide Settings until it does something.

---

## Quick wins

Small diffs, high clarity. Roughly ordered.

1. **Stop minting fake share URLs** — disable Share or copy `downloadUrl` with an expiry disclaimer (B1).
2. **Redirect `/dashboard` → `/dashboard/media-assets`** (F1).
3. **Parse workspaces once** — map `memberships` → `{ id: tenant.id, name, role, storageUsed, ... }` (B2).
4. **Pass `?ws=` on every dashboard `Link`** (B4).
5. **`openUserProfile()` for Account Profile**; remove the Settings detour (F2).
6. **Do not intercept `/` when `event.target` is `input`/`textarea`/`select`/contenteditable** (B15).
7. **Disable Start Upload when `!selectedFile`**; fix 500MB vs 100MB copy (B9, B16).
8. **`meta.suppressErrorToast` on mutations that already toast** (B10). Toast favorite success in `onSuccess`, not before `await` (B11).
9. **Hide Upload Folder** until it uploads folders.
10. **Remove or hide dead chrome:** notification badge, Help, Upgrade, Architecture anchor, pricing “Contact Sales” → `/register`.
11. **JSON-safe fetch** — empty body → `null`; non-JSON → status text (B12).
12. **Delete unused surface area:** `components/dam/StatsOverview.tsx`, `components/ui/Input.tsx` (unused), `axios` / `react-hook-form` / `zod` / `@hookform/resolvers` / `class-variance-authority` if still unused after PR #1; stop committing `.DS_Store`.
13. **`dev`:** merge PR #1’s ID-check retry and fail-closed env (B5, B6, B19) before more feature work.
14. **Node engines:** if PR #1 keeps `>=24.19.0`, confirm that matches deploy images; otherwise pin to 20/22 LTS (B20).

---

## Tests — what exists vs what the risks need

**Coverage today: none.**

Minimum tests that would lock the bugs above (no need for a full Playwright suite first):

| Risk | Suggested test |
| --- | --- |
| B1 | Share handler never writes `imadeo.io/share/${Date.now()}`; clipboard is API URL or control is disabled |
| B2 | Fixture `{ memberships: [...] }` and `{ workspaces: [...] }` both yield switcher + storage |
| B3/B4 | Sidebar `href` includes current `ws` |
| B5 | Failed get-imadeo-id shows retry, not create-id (PR #1) |
| B7 | Drawer offers rename and calls PATCH |
| B9 | 100MB+ file shows the same limit as copy |
| B12 | DELETE 204 does not throw |
| F1 | `/dashboard` redirects to media-assets |
| Favorites | Delete/download either work or are absent, not silent no-ops |

`npm run check` (`typecheck && lint && build`) on PR #1 is a good CI gate but does not exercise any of the above.

---

## Security / performance notes (not duplicated as bugs)

- **Auth:** Clerk middleware on `/dashboard` is the right shape. Production JWT template + API URL must be set (PR #1). Session fallback in `getApiToken` can still send a token the API will 401 — prefer failing if the template returns null.
- **XSS:** Asset names go through React text; no `dangerouslySetInnerHTML` found. Fake share is the main user-harm vector.
- **Tokens:** Prefer Clerk; do not reintroduce `localStorage` JWTs (`dev` `useAuthStore`).
- **Perf:** Root layout client-side + Framer on every card (`delay: idx * 0.03`) will stutter on large pages; infinite scroll helps. Google Fonts `@import` in `globals.css` blocks rendering; self-host or `next/font`.
- **Images:** `remotePatterns` allow localhost, `api.imadeo.in`, `api-dev.imadeo.in`, Clerk; asset thumbs often use raw `<img>`, not `next/image`.
- **Headers (PR #1):** `X-Frame-Options`, `nosniff`, `Referrer-Policy`. Still no CSP.

---

## Architecture map (for maintainers)

```text
ClerkProvider (app/layout.tsx, client)
  ReactQueryProvider (toast on mutation error)
    marketing | Clerk pages
    dashboard/layout.tsx
      boot: getApiToken → getImadeoIdApi
      persist: useTenantStore (localStorage imadeo-tenant-storage)
      Sidebar (nav, storage widget, sign out)
      children (pages)
      CreateImadeoIdModal (blocking)
      UploadModal → useUploadAsset → presign PUT complete + thumb poll

Media Assets
  useFolderTree / useAssets(infinite, filters)
  folder CRUD hooks
  optimistic favorites across ['assets', tenantId, ...]
```

**Env (see `.env.example` on PR #1):** `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_JWT_TEMPLATE`, `NEXT_PUBLIC_API_URL`.

---

## Suggested fix order

1. B1 (fake share), F1 (land on Media Assets), B2 (workspace parse) — user-visible trust.
2. Merge/finish PR #1 (B5/B6/B19, error UI, Coming Soon honesty).
3. B4 + P2 (tenant in URL).
4. B7/B8/P4 (inspector actions); B9 (upload honesty).
5. Tests for B1/B2/B12; then Overview/settings as real features.
