import Link from 'next/link';

const Header = () => {
  return (
    <header className="fixed top-0 right-0 left-0 z-10 flex h-16 items-center justify-between bg-white p-4">
      <Link href="/" className="font-mono text-lg font-bold uppercase">
        Neubrai
      </Link>
      
    </header>
  );
};

export default Header;
