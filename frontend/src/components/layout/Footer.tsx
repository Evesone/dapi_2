import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 mt-12">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Logo />
            <span className="ml-2 font-bold font-headline">DAPI</span>
          </div>
          <nav className="flex space-x-6 text-muted-foreground mb-4 md:mb-0">
            <Link href="/#features" className="hover:text-primary">Features</Link>
            <Link href="/design" className="hover:text-primary">Design</Link>
            <Link href="/#faq" className="hover:text-primary">FAQ</Link>
          </nav>
          <div className="flex space-x-4">
            {/* Social media icons can go here */}
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground mt-8">
          © {new Date().getFullYear()} DAPI. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
