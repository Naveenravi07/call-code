import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import LandingPage from './pages/landing';
import LoginPage from './pages/login';
import AuthSuccess from './pages/authsucess';
import Playground from './pages/playground';

// Create a root component to wrap the routes
const RootComponent = (): JSX.Element => {
  return (
    <div className="app-root">
      <Outlet />
    </div>
  );
};

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const authSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/success',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string,
    };
  },
  component: AuthSuccess,
});

const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/playground',
  component: Playground,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authSuccessRoute,
  playgroundRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
} 