# Mneme World Generator

A progressive web application for generating and managing fictional worlds, built with modern web technologies.

## 🚀 Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme tokens
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Fonts**: Inter (sans-serif) & IBM Plex Mono (monospace)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher
- **npm**: v9 or higher (comes with Node.js)

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/StevenTiu22/mneme-world-generator-pwa.git
cd mneme-world-generator-pwa
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the production-ready application
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 🎨 Project Structure

```
mneme-world-generator-pwa/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, logos, and media files
│   ├── components/     # React components
│   │   ├── layout/    # Layout components (MainLayout, CenteredLayout)
│   │   ├── shared/    # Shared components (Header, Footer)
│   │   └── ui/        # shadcn/ui components (Button, Card, etc.)
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components (Home, CreateNew, etc.)
│   ├── App.tsx        # Root application component
│   ├── routes.tsx     # React Router configuration
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles and Tailwind configuration
├── components.json     # shadcn/ui configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.ts     # Vite configuration
```

## 🎯 Features

- **World Generation**: Create custom worlds with detailed parameters
- **Dark/Light Theme**: Toggle between dark and light modes with persistent preference
- **Responsive Design**: Optimized for desktop and mobile devices
- **Type-Safe**: Full TypeScript support for better developer experience
- **Modern UI**: Beautiful, accessible components built with shadcn/ui

## 🧩 Adding shadcn/ui Components

To add new shadcn/ui components to the project:

```bash
npx shadcn@latest add [component-name]
```

Example:

```bash
npx shadcn@latest add dialog
```

## 🎨 Theme Customization

The application uses CSS variables for theming. You can customize colors in `src/index.css`:

- Light mode colors are defined in `:root`
- Dark mode colors are defined in `.dark`
- Theme tokens include: `background`, `foreground`, `primary`, `secondary`, `accent`, `muted`, etc.

## 🌐 Routing

The application uses React Router DOM for navigation. Routes are defined in `src/routes.tsx`:

- `/` - Home page
- `/create-new` - World creation selection
- `/create-new/custom` - Custom world creation (Primary Star configuration)
- `/my-worlds` - User's saved worlds (coming soon)

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👤 Author

**Justine Cesar Aquino**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)

---

Built with ❤️ using React, TypeScript, and Vite
