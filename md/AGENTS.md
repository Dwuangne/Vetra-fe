# Vetra-fe — hướng dẫn cho agent / developer

Tài liệu này cố định **cách đặt tên và bố cục code** trong `Vetra-fe` (Next.js App Router). Khi thêm feature mới, **bám sát** cấu trúc dưới đây để đồng bộ với `auth`, `home`, `public-scan`.

---

## 1. Feature folder (`features/<tên-feature>/`)

- **Tên folder**: `kebab-case` (ví dụ `public-scan`, `auth`, `home`).
- **Một feature = một domain UI/use case**; không nhét logic không liên quan vào cùng folder.

### Cấu trúc chuẩn (luôn dùng các tên folder này khi cần)

```
features/<feature-name>/
  index.ts              # Bắt buộc: export ra ngoài (facade). App chỉ import từ đây khi có thể.
  constants.ts          # Tuỳ chọn: hằng số chỉ dùng trong feature.
  model/                # Types, DTO khớp API — file *.types.ts (hoặc *.schema.ts nếu có zod).
  hooks/                # React hooks — file use-<tên>.ts (kebab), export camelCase (useLoginForm).
  services/             # Gọi API, đọc JSON, helper không render — *.ts kebab-case.
  ui/                   # Mọi component React — file *.tsx kebab-case, export component PascalCase.
```

**Không dùng** folder tên `components/` trong feature — gom vào `ui/` để tránh hai convention song song.

### Quy tắc file

| Loại        | Tên file              | Export trong code        |
|------------|------------------------|---------------------------|
| UI         | `login-screen.tsx`     | `export function LoginScreen` |
| Hook       | `use-login-form.ts`    | `export function useLoginForm` |
| Service    | `lib/api/services/public-scan.service.ts` | `export async function getPublicScan` |
| Types      | `lib/api/types/public-scan.ts` | `export type PublicScanResultDto` |
| Hằng       | `constants.ts`         | `export const AUTH_BRAND_HEX` |

- **File**: luôn **kebab-case** (`home-page.tsx`, không `HomePage.tsx` nằm rời ngoài `ui/`).
- **Component / type / hook** trong code: **PascalCase** / **camelCase** theo chuẩn TypeScript/React.

### `index.ts` của feature

- Chỉ re-export những gì **route hoặc feature khác** cần (screen chính, loader, types dùng chung).
- Tránh export nội bộ từng file `ui/*` lẻ trừ khi có lý do (test, storybook).

**Ví dụ import từ app:**

```ts
import { HomePage } from "@/features/home";
import { LoginScreen } from "@/features/auth";
import { getPublicScan } from "@/lib/api/services/public-scan.service";
import { PublicScanActive } from "@/features/public-scan";
```

---

## 2. App Router (`app/`)

- `app/**/page.tsx`: **mỏng** — import từ `@/features/...`, metadata, không nhét UI lớn.
- Client boundary: đặt `"use client"` ở **component trong `features/.../ui`** hoặc hook; page server có thể chỉ `return <LoginScreen />` nếu `LoginScreen` là client component.

---

## 3. UI dùng chung (shadcn / Radix)

- `components/ui/*`: thư viện primitive (shadcn) — **dùng lại toàn app**, không đặt trong từng `features/`.
- `components/theme-provider.tsx` (tuỳ chọn) + `lib/utils.ts` (`cn`).

Feature chỉ gồm **màn hình / domain**; import ví dụ: `import { Button } from "@/components/ui/button"`.

---

## 4. API layer (`lib/api/`)

- HTTP chung, base URL, type envelope: giữ trong `lib/api`.
- Feature **gọi** `lib/api` từ `features/<name>/services/` hoặc `hooks/` — không copy URL rải rác ngoài `lib/api/endpoints.ts`.

---

## 5. Import path

- Dùng alias **`@/`** (root project).
- Trong cùng một feature, ưu tiên **import tương đối** giữa `ui/`, `hooks/`, `model/`, `services/` (`../model/foo.types`) để tránh chuỗi `@/features/...` dài và dễ refactor folder.

---

## 6. Checklist feature mới

1. Tạo `features/<my-feature>/`.
2. Thêm `index.ts` với export công khai.
3. UI → `ui/<screen-or-widget>.tsx`.
4. State/side effect UI → `hooks/use-<something>.ts`.
5. Fetch / map data → `services/<verb-or-resource>.ts`.
6. Type DTO → `model/<feature>.types.ts`.
7. Cập nhật `app/.../page.tsx` import từ `@/features/<my-feature>`.

---

## 7. Ngôn ngữ & copy

- UI có thể **tiếng Việt** hoặc **English** tùy màn; giữ nhất quán trong cùng một luồng (ví dụ toàn bộ auth EN, QR trace VI).

---

## 8. Biến môi trường (`.env`) — `npm run dev` vs Docker

Next.js chỉ đưa biến vào **code chạy trên trình duyệt** nếu tên bắt đầu bằng `NEXT_PUBLIC_`. `getApiBaseUrl()` đọc `NEXT_PUBLIC_API_BASE_URL`.

### Chạy `npm run dev` (trong thư mục `Vetra-fe`)

1. Copy `.env.example` → `.env.local` (file này thường không commit).
2. Sửa URL trỏ tới API đang chạy trên máy bạn, ví dụ:
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:5078` (HTTP profile của `Vetra-be`), hoặc `https://localhost:7188` nếu bạn chạy HTTPS.
3. Restart `npm run dev` sau khi đổi `.env.local`.

Thứ tự ưu tiên file env của Next: xem [tài liệu Next — Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables).

### Chạy `docker compose` (FE + BE trong container)

- Request `fetch` từ **trình duyệt** trên máy bạn vẫn gửi từ máy bạn → URL phải là địa chỉ **máy host nhìn thấy** (ví dụ `http://localhost:8080` trùng cổng publish của `Vetra-be`), **không** dùng `http://Vetra-be:8080` (tên đó chỉ resolve được **trong** mạng Docker, không phải trong tab Chrome trên PC).
- `NEXT_PUBLIC_*` được **nhúng lúc `next build`**, không đọc lại từ `environment:` của service khi container đã chạy. Vì vậy repo dùng **`Dockerfile` `ARG` + `docker-compose.yml` `build.args`** để truyền URL lúc build image.
- Đổi URL API khi deploy: sửa `build.args.NEXT_PUBLIC_API_BASE_URL` (hoặc build image tay với `--build-arg`) rồi `docker compose build --no-cache Vetra-fe`.

`.dockerignore` loại `.env*` khỏi context build để tránh lỡ đưa secret vào image; Docker dùng build-arg thay vì copy `.env.local`.

---

_File này là nguồn chuẩn cho Cursor/agent: khi mơ hồ về cấu trúc, ưu tiên tuân theo mục 1._
