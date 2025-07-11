import Link from "next/link";
import { AppLogo } from "@/components/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-card">
       <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                <AppLogo className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold font-headline">SenAgriConnect</span>
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
