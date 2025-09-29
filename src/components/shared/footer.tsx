export function Footer() {
  return (
    <footer className="border-t bg-background/80 py-6 text-muted-foreground transition-colors dark:bg-background/40">
      <div className="container mx-auto text-center space-y-2">
        <p className="text-sm">Owned by Justine Cesar Aquino</p>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary dark:hover:text-primary"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20 4a1 1 0 0 1 .98.8l1.5 8a1 1 0 0 1-.46.99 21.2 21.2 0 0 1-5.2 2.3l-.5-.98a17.4 17.4 0 0 0 2.6-1.1l-.6-.3a9.4 9.4 0 0 1-1.9-.99 6.4 6.4 0 0 1-5.46.02 9.4 9.4 0 0 1-1.9 1c-.2.1-.4.2-.6.3.84.42 1.72.77 2.63 1.04l-.5.98a21.3 21.3 0 0 1-5.2-2.3 1 1 0 0 1-.46-.98l1.5-8A1 1 0 0 1 4 4h2.1a1 1 0 0 1 .94.66l.38 1.03A13.2 13.2 0 0 1 12 5c1.74 0 3.45.35 5 .99l.35-.96A1 1 0 0 1 17.9 4zm-8.62 5.75c-.65 0-1.18.56-1.18 1.25s.53 1.25 1.18 1.25C12.03 12.25 12.55 11.7 12.55 11s-.53-1.25-1.18-1.25m4.24 0c-.65 0-1.18.56-1.18 1.25s.53 1.25 1.18 1.25c.65 0 1.18-.56 1.18-1.25s-.53-1.25-1.18-1.25" />
          </svg>
          Discord placeholder
        </a>
      </div>
    </footer>
  );
}
