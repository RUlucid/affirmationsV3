export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose md:text-left">
            Built with ❤️ for mental wellness and personal growth.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <nav className="flex items-center space-x-4 text-sm">
            <a href="/privacy" className="transition-colors hover:text-foreground/80">
              Privacy
            </a>
            <a href="/terms" className="transition-colors hover:text-foreground/80">
              Terms
            </a>
            <a href="/contact" className="transition-colors hover:text-foreground/80">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}