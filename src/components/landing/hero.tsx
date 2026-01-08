import Link from "next/link";

export default function Hero() {
  return (
    <div className="text-center w-full bg-bg-primary border-x border-stone-200 h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-medium font-sans">
        Simple analytics for projects you own
      </h1>
      <p className="text-b text-gray-500 max-w-xl mx-auto">
        Get insights into your website traffic and user behavior with our
        simple and privacy-friendly analytics tool.
      </p>
      <div className="flex flex-col items-center gap-2">
        <span>
          <Link
        href="/dashboard/analytics"
        className="inline-flex items-center justify-center bg-primary text-white text-sm font-sans px-4 py-2 rounded-[6px] hover:opacity-90 transition-opacity"
      >
        Go to dashboard
      </Link>
        </span>
      
      {/* <span>
        <Link 
        href="/api/auth/signin"
        className="inline-flex items-center justify-center bg-primary text-white text-sm font-sans px-4 py-2 rounded-[6px] hover:opacity-90 transition-opacity">
          Sign up
        </Link>
      </span> */}

      </div>

    </div>
  );
}