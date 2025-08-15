import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import LandingPage from './pages/landing';
import LoginPage from './pages/login';
import AuthSuccess from './pages/authsucess';
import Playground from './pages/playground';
import FileTree from './components/editor/Filetree';
import CodePlayGround from './components/editor/Playground';
import Editor from './components/editor/Editor';

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
  validateSearch: search => {
    return {
      session_name: search.session_name as string | undefined,
    };
  },
});

const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/test',
  component: () => (
    <>
      <div className="flex-1 flex overflow-hidden">
        <FileTree />
        <Editor />
        <CodePlayGround />
      </div>
    </>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authSuccessRoute,
  playgroundRoute,
  testRoute,
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
