import Link from "next/link";
import { signIn } from "../../auth";



export default function Navbar({ session }: { session: any }) {
  
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b  h-16">
      <div className="flex items-center space-x-2">
        <Link href="/#"> 
         <img
          src="/logo.png"
          alt="logo"
          className="h-15 md:h-18 w-16 cursor-pointer"
          style={{ maxHeight: "48px" }}
        />
        </Link>
       
     
      </div>
      <nav className="hidden md:flex space-x-6 text-gray-700">
        <Link href="/order" className="hover:text-[#026766] cursor-pointer transition-colors">Printing</Link>
        <Link href="/order" className="hover:text-[#026766] cursor-pointer transition-colors">About</Link>
        <Link href="/order" className="hover:text-[#026766] cursor-pointer transition-colors">Contact</Link>
      </nav>
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-1 text-gray-700">
          <span>in</span>
          <span>English</span>
        </div>
        
        {session && session.user ? (
            <div>
              <p>{session.user.email}</p>
            </div>
        ):(
          
            <form action={async ()=>{
            "use server"
            await signIn('google')}}>
            <button type="submit" className="text-gray-700 hover:text-teal-600 cursor-pointer">
                Sign In
            </button>
         </form>
         
        )}
       
       
      </div>
    </header>
  );
}