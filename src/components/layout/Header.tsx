'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AppLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';



const menuItems = [
    { href: '/', label: 'Accueil' },
    { href: '/explorer', label: 'Explorer' },
    { href: '/forum', label: 'Forum' },
    { href: '/ia-quiz', label: 'IA/Quiz' },
];

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const getInitials = () => {
        if (!user) return "??";
        const name = user.fullName;
        if (name) return name.split(' ').map((n:string) => n[0]).join('');
        return user.email?.substring(0, 2).toUpperCase() || '??';
    };

    const displayName = user?.fullName || user?.email;

    const allMenuItems = user ? [...menuItems] : menuItems;

    return (
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <nav className="flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <AppLogo className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold font-headline">SenAgriConnect</span>
                </Link>
                <ul className="hidden md:flex items-center gap-4">
                    {allMenuItems.map((item) => (
                        <li key={item.href}>
                                                            <Link href={item.href} className={`relative font-medium pb-1 transition-all duration-300 hover:scale-105 ${pathname === item.href ? 'text-primary shadow-md' : 'text-muted-foreground hover:text-primary/80'}`}>
                                                                {item.label}
                                                                {pathname === item.href && (
                                                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></span>
                                                                )}
                                                            </Link>                        </li>
                    ))}
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative font-medium pb-1 transition-all duration-300 hover:scale-105 text-muted-foreground hover:text-primary/80">
                                    Mon Tableau de Bord
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="start" forceMount>
                                {NAV_LINKS.map((item) => (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href}>
                                            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                            <span>{item.label}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </ul>
                <div className="flex items-center gap-2">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl || undefined} alt={displayName || "User"} />
                                        <AvatarFallback>{getInitials()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{displayName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profil</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Se déconnecter</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Se connecter</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">S'inscrire</Link>
                            </Button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}