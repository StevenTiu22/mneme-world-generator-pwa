# Development Instructions for Mneme World Generator

This document provides detailed instructions for developers and AI assistants working on the Mneme World Generator PWA project.

## Project Overview

**Mneme World Generator** is a progressive web application designed to help users generate and manage fictional worlds for creative writing, game development, or worldbuilding projects. The application uses a modern tech stack with React, TypeScript, and Vite.

## Technology Stack

### Core Technologies

- **React 19** - UI library for building component-based interfaces
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite 7** - Fast build tool and development server
- **React Router DOM v7** - Client-side routing

### UI & Styling

- **shadcn/ui** - Pre-built accessible components built on Radix UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **tailwindcss-animate** - Animation utilities for Tailwind

### Fonts

- **Inter** - Primary sans-serif font
- **IBM Plex Mono** - Monospace font for code/technical displays

## Architecture & Patterns

### Component Structure

```
src/
├── components/
│   ├── layout/      # Layout wrappers (MainLayout, CenteredLayout)
│   ├── shared/      # Reusable shared components (Header, Footer)
│   └── ui/          # shadcn/ui components (Button, Card, Input, etc.)
├── pages/           # Route-level page components
├── lib/             # Utility functions (e.g., cn() for className merging)
└── assets/          # Static assets (images, logos)
```

### Layout System

**Two main layouts:**

1. **MainLayout** (`src/components/layout/main-layout.tsx`)

   - Used for: Home page and general navigation pages
   - Structure: Header + Main content + Footer
   - Main content uses flexbox to center content vertically and horizontally

2. **CenteredLayout** (`src/components/layout/centered-layout.tsx`)
   - Used for: Creation flows and focused task pages
   - Structure: Back button + Centered content
   - No header/footer for distraction-free experience

### Routing Structure

Routes are defined in `src/routes.tsx`:

```tsx
/ - Home page (MainLayout)
/my-worlds - User's saved worlds list (MainLayout)
/create-new - World creation mode selection (CenteredLayout)
/create-new/custom - Custom world creation wizard (CenteredLayout)
```

### State Management

- **Theme State**: Managed by `ThemeProvider` component using React Context
- **Local Storage**: Theme preference persisted to localStorage
- **Router State**: Navigation state managed by React Router DOM

## Styling Guidelines

### Theme System

The application uses CSS custom properties (CSS variables) for theming:

**Color Tokens:**

- `--background` / `--foreground` - Base page colors
- `--primary` / `--primary-foreground` - Primary action colors
- `--secondary` / `--secondary-foreground` - Secondary elements
- `--accent` / `--accent-foreground` - Accent/highlight colors
- `--muted` / `--muted-foreground` - Muted/subtle colors
- `--destructive` / `--destructive-foreground` - Error/danger colors
- `--border` / `--input` / `--ring` - UI element borders and focus rings

**Theme Toggle:**

- Themes are defined in `src/index.css` using `:root` (light) and `.dark` (dark mode)
- The `ThemeProvider` adds/removes the `.dark` class on `<html>` element
- All components should use theme tokens for colors (e.g., `text-foreground`, `bg-background`)

### Tailwind Conventions

1. **Use theme tokens** instead of hardcoded colors:

   ```tsx
   // ✅ Good
   className = "text-foreground bg-background";

   // ❌ Avoid
   className = "text-black bg-white";
   ```

2. **Dark mode variants** when needed:

   ```tsx
   className = "text-muted-foreground dark:text-muted-foreground/80";
   ```

3. **Utility classes for layout**:

   - Use flexbox/grid utilities: `flex`, `grid`, `items-center`, `justify-between`
   - Spacing: `gap-4`, `space-y-2`, `px-8`, `py-6`

4. **Component composition** with `cn()` utility:

   ```tsx
   import { cn } from "@/lib/utils"

   className={cn("base-classes", conditionalClasses && "conditional", className)}
   ```

## Component Guidelines

### shadcn/ui Components

**Adding new components:**

```bash
npx shadcn@latest add [component-name]
```

**Customizing components:**

- Components are installed in `src/components/ui/`
- Modify directly in these files - they're meant to be customized
- Use `variants` prop for predefined styles (e.g., `variant="outline"`)

**Common components:**

- `Button` - Variants: default, destructive, outline, secondary, ghost, link
- `Card` - Use with `CardHeader`, `CardContent`, `CardFooter`
- `Input` - Form inputs with consistent styling
- `NavigationMenu` - Header navigation with dropdown support

### Creating New Pages

1. **Create page component** in `src/pages/`:

   ```tsx
   export function MyNewPage() {
     return (
       <div className="container">
         <h1>Page Title</h1>
         {/* content */}
       </div>
     );
   }
   ```

2. **Add route** in `src/routes.tsx`:

   ```tsx
   <Route path="/my-new-page" element={<MyNewPage />} />
   ```

3. **Choose appropriate layout** (MainLayout or CenteredLayout)

### TypeScript Patterns

**Component Props:**

```tsx
interface MyComponentProps {
  title: string;
  count?: number; // optional
  onAction: () => void;
}

export function MyComponent({ title, count = 0, onAction }: MyComponentProps) {
  // ...
}
```

**Type Imports:**

```tsx
import type { ReactNode } from "react";
```

## Development Workflow

### Starting Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start dev server:**

   ```bash
   npm run dev
   ```

   - Opens at `http://localhost:5173`
   - Hot Module Replacement (HMR) enabled

3. **Lint code:**
   ```bash
   npm run lint
   ```

### Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Code Quality

**ESLint configuration:**

- Uses TypeScript ESLint parser
- React Hooks rules enabled
- React Refresh plugin for HMR

**Best Practices:**

- Use TypeScript for all new files
- Follow React hooks rules
- Use semantic HTML elements
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test in both light and dark modes

## Common Tasks

### Adding a New Feature Page

1. Create component in `src/pages/FeatureName.tsx`
2. Add route in `src/routes.tsx`
3. Add navigation link in `Header` component if needed
4. Use appropriate layout (MainLayout or CenteredLayout)
5. Follow theme token conventions for styling

### Adding a Form

1. Use shadcn/ui form components:

   ```bash
   npx shadcn@latest add form
   npx shadcn@latest add input
   npx shadcn@latest add label
   ```

2. Create form with proper labels and accessibility:
   ```tsx
   <Label htmlFor="name">Name</Label>
   <Input id="name" type="text" />
   ```

### Adding Navigation Items

Edit `src/components/shared/header.tsx`:

```tsx
<NavigationMenuItem>
  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
    <NavLink to="/new-route">New Page</NavLink>
  </NavigationMenuLink>
</NavigationMenuItem>
```

### Updating Theme Colors

Edit `src/index.css`:

```css
:root {
  --primary: oklch(0.208 0.042 265.755); /* light mode */
}

.dark {
  --primary: oklch(0.929 0.013 255.508); /* dark mode */
}
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `MyComponent.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Pages**: PascalCase (e.g., `CreateNew.tsx`)
- **Styles**: kebab-case (e.g., `index.css`)

## Import Aliases

The project uses `@/` as an alias for `src/`:

```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

Configured in:

- `vite.config.ts`
- `tsconfig.json`

## Key Dependencies

| Package          | Version  | Purpose       |
| ---------------- | -------- | ------------- |
| react            | ^19.1.1  | UI library    |
| react-router-dom | ^7.9.1   | Routing       |
| tailwindcss      | ^4.1.13  | Styling       |
| @radix-ui/\*     | various  | UI primitives |
| lucide-react     | ^0.544.0 | Icons         |
| vite             | ^7.1.2   | Build tool    |

## Troubleshooting

### Build Errors

**Issue**: TypeScript errors during build

- **Solution**: Run `npm run lint` to identify issues
- Check for missing type definitions
- Ensure all imports are correct

**Issue**: Tailwind classes not applying

- **Solution**: Verify class names in `tailwind.config.js` content paths
- Check for typos in utility class names
- Ensure `@import "tailwindcss"` is first in `index.css`

### Development Issues

**Issue**: HMR not working

- **Solution**: Restart dev server
- Clear browser cache
- Check for console errors

**Issue**: Theme not persisting

- **Solution**: Check localStorage in DevTools
- Verify `ThemeProvider` is wrapping the app in `main.tsx`

## Project Owner

**Justine Cesar Aquino**

## Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)

---

Last Updated: September 30, 2025
