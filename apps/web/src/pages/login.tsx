import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { loginWithGithub, loginWithGoogle } from '@/apis/auth';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email/Username</Label>
            <Input id="email" type="text" placeholder="Enter your email or username" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" required />
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </div>
        <div className="space-y-4">
          <Separator>or sign in with</Separator>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                console.log('Clicked');
                loginWithGithub();
              }}
              variant="outline"
              className="w-full"
            >
              <GitlabIcon className="h-5 w-5 mr-2" />
              Sign in with GitHub
            </Button>
            <Button
              onClick={() => {
                console.log('Clicked');
                loginWithGoogle();
              }}
              variant="outline"
              className="w-full"
            >
              <ChromeIcon className="h-5 w-5 mr-2" />
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
interface IconProps extends React.SVGProps<SVGSVGElement> {}

function ChromeIcon(props: IconProps) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" x2="12" y1="8" y2="8" />
      <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
      <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
    </svg>
  );
}

function GitlabIcon(props: IconProps) {
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
      <path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.22-.11.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18l-2.26 6.67H8.32L6.1 3.26a.42.42 0 0 0-.1-.18.38.38 0 0 0-.26-.08.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18L2 13.29a.74.74 0 0 0 .27.83L12 21l9.69-6.88a.71.71 0 0 0 .31-.83Z" />
    </svg>
  );
}
