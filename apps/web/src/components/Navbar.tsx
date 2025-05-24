import React from 'react';
import { Link } from '@tanstack/react-router';
import { logoutUser } from '@/apis/auth';
import useAuth from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function Navbar() {
  const { user, isLoading, invalidate } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  async function handleLogout() {
    try {
      await logoutUser();
      queryClient.setQueryData(['user'], null);
      invalidate();
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      invalidate();
      toast({
        title: 'Logout failed',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 px-4 border-b shrink-0 bg-background/95 backdrop-blur-sm md:px-6">
      <Link to="/" className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-primary/80">
        <LogoIcon className="h-6 w-6" />
        <span>Call Code</span>
      </Link>
      
      <div className="flex items-center gap-4 ml-auto">
        {isLoading ? (
          <LoadingSpinner />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.pfp ?? ""} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2" sideOffset={8}>
              <div className="flex flex-col space-y-1 p-2">
                <p className="font-medium text-base truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2">
                <User className="h-4 w-4" />
                <Link to="/" className="flex-1">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 cursor-pointer py-2 text-destructive hover:text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="flex-1">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login">
            <Button className="gap-2">
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m8 16 2-2-2-2" />
      <path d="M12 18h4" />
    </svg>
  );
}