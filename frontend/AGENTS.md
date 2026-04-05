# Frontend Development Guidelines (AGENTS.md)

This document outlines the best practices and standards for frontend development in this project.

## 🚀 Core Principles

### 1. Modularity & Scalability
- **Break it down**: If a component is larger than 100-150 lines, it's probably doing too much. Split it into smaller, reusable sub-components.
- **Custom Hooks**: Move logic (state, effects, data fetching) out of components and into custom hooks located in `src/hooks`.
- **Single Responsibility**: Each component should do one thing and do it well.

### 2. Design System: Shadcn/UI
We use **Shadcn/UI** as our primary design system. It provides high-quality, accessible primitives that we can customize.
- **Use Primitives**: Always prefer using the base primitives (Button, Input, Dialog, etc.) from `src/components/ui`.
- **Consistency**: Stick to the Tailwind CSS classes defined in the design system to ensure a unified look and feel.
- **Tailwind Merge**: Use a `cn()` utility (combining `clsx` and `tailwind-merge`) for conditional classes.

### 3. Component Guidelines
- **Keep it Simple**: Avoid deeply nested components.
- **Functional Components**: Use arrow functions and TypeScript for all components.
- **Props**: Use clear, descriptive names for props. Pass only what is needed.

#### Example: Component vs Hook

**Bad (Large component with mixed logic):**
```tsx
// src/app/page.tsx (Too large!)
export default function Page() {
  const [data, setData] = useState([]);
  useEffect(() => { /* fetch data */ }, []);
  return (
    <div>
       {/* 200 lines of UI here */}
    </div>
  );
}
```

**Good (Modular):**
```tsx
// src/hooks/use-data.ts
export function useData() {
  const [data, setData] = useState([]);
  useEffect(() => { /* fetch data */ }, []);
  return { data };
}

// src/components/data-list.tsx
import { useData } from "@/hooks/use-data";
export function DataList() {
  const { data } = useData();
  return <ul>{data.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}
```

## 📂 Domain-Driven Structure (Feature-Based)

To scale effectively, we follow a **Domain-Driven Design (DDD)** approach where each major feature or entity has its own self-contained folder. This makes it easy to find everything related to a specific part of the app.

### 1. `src/domains/` (The Core)
This is where the business logic and feature-specific UI live. Each domain (e.g., `processes`, `executions`, `auth`) should contain:
- `components/`: UI components used ONLY in this domain.
- `hooks/`: Logic, state, and data fetching for this domain (e.g., `useProcesses.ts`).
- `services/`: API client functions specific to this domain.
- `types.ts`: TypeScript interfaces for this domain's data.

**Example Structure:**
```text
src/domains/processes/
├── components/
│   ├── process-list.tsx
│   └── process-card.tsx
├── hooks/
│   └── use-processes.ts
├── services/
│   └── process-api.ts
└── types.ts
```

### 2. `src/shared/` (The Foundation)
Reusable code that is shared across multiple domains.
- `ui/`: **Shadcn/UI primitives** (Button, Input, etc.).
- `components/`: Global UI pieces like `Navbar`, `Footer`, `Sidebar`.
- `hooks/`: Generic hooks like `useDebounce`, `useMediaQuery`.
- `lib/`: Library configurations (e.g., `axios`, `swr`).
- `utils/`: Pure helper functions (formatting, validation).

### 3. `src/app/` (The Router)
Next.js pages that import and orchestrate domain components. Pages should be small and mainly handle routing and layout.

### 4. ✅ Typing & Validations
- **Strict Typing**: Use TypeScript for everything. Avoid `any` at all costs. Use strong type definitions for all API responses and component props.
- **Local Checks**: Before committing or pushing, always verify your code with:
  - `pnpm typecheck`: Ensure there are no TypeScript errors.
  - `pnpm lint`: Verify code style and common pitfalls.
  - `pnpm build`: Confirm the application builds correctly for production.
  - `pnpm test`: Run the unit/integration tests to prevent regressions.

## 🚀 Why This Works
- **Isolation**: Changes in the `processes` domain won't accidentally break the `auth` domain.
- **Discoverability**: Everything related to a feature is in one place.
- **Refactoring**: It's easy to move or delete an entire feature by handling its domain folder.

## 🛠️ Implementation Example

```tsx
// src/app/processes/page.tsx
import { ProcessList } from "@/domains/processes/components/process-list";
import { useProcesses } from "@/domains/processes/hooks/use-processes";

export default function ProcessesPage() {
  const { data, isLoading } = useProcesses();

  return (
    <div className="p-8">
      <h1>My Processes</h1>
      <ProcessList data={data} loading={isLoading} />
    </div>
  );
}
```

## ❌ What to Avoid
- **God Files**: No single file should exceed 150-200 lines. Split logic into hooks and UI into small sub-components.
- **Circular Dependencies**: Domains should ideally not import from each other. If logic is shared, move it to `src/shared`.
- **Inline Styles**: Always use Tailwind CSS classes and the Shadcn design tokens.

---
*Happy coding!*
