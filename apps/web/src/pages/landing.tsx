import { Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Create Meetings Quickly
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Easily schedule meetings with your team or clients. Generate a meeting link and
                    share it with participants.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link
                    to="#"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Create Meeting
                  </Link>
                </div>
              </div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Meeting Details</CardTitle>
                  <CardDescription>Fill out the form to create a new meeting.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Label htmlFor="title">
                      <span className="font-medium">Title</span>
                      <Input id="title" placeholder="Meeting Title" />
                    </Label>
                    <Label htmlFor="date">
                      <span className="font-medium">Date</span>
                      <Input id="date" type="date" />
                    </Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Label htmlFor="time">
                      <span className="font-medium">Time</span>
                      <Input id="time" type="time" />
                    </Label>
                    <Label htmlFor="template">
                      <span className="font-medium">Template</span>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="nextjs">Next.js</SelectItem>
                          <SelectItem value="express">Express</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                        </SelectContent>
                      </Select>
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Generate Meeting Link</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted p-6 md:py-12 w-full">
        <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
          <div className="grid gap-1">
            <h3 className="font-semibold">Company</h3>
            <Link to="#">About Us</Link>
            <Link to="#">Our Team</Link>
            <Link to="#">Careers</Link>
            <Link to="#">News</Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">Products</h3>
            <Link to="#">Meetings</Link>
            <Link to="#">Webinars</Link>
            <Link to="#">Presentations</Link>
            <Link to="#">Workshops</Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">Resources</h3>
            <Link to="#">Blog</Link>
            <Link to="#">Community</Link>
            <Link to="#">Support</Link>
            <Link to="#">FAQs</Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">Legal</h3>
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
            <Link to="#">Cookie Policy</Link>
          </div>
          <div className="grid gap-1">
            <h3 className="font-semibold">Contact</h3>
            <Link to="#">Support</Link>
            <Link to="#">Sales</Link>
            <Link to="#">Press</Link>
            <Link to="#">Partnerships</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
