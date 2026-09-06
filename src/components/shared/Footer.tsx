import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 px-6 md:px-12 xl:px-[128px] border-t border-border mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-muted-foreground text-sm">
          &copy; {currentYear} Buku Digital Keluarga Besar. All rights reserved.
        </div>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/admin" 
            className="text-muted-foreground text-sm hover:text-primary transition-colors"
          >
            Admin Access
          </Link>
        </div>
      </div>
    </footer>
  );
}
