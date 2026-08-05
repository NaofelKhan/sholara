import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Dashboard from './pages/Dashboard';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Auth from "@/pages/Auth";
import Signup from "./pages/Signup";
import SkillExchange from "./pages/SkillExchange";
import OfferSkill from "./pages/OfferSkill";
import RequestSkillPage from "./pages/RequestSkillPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/skill-exchange" component={SkillExchange} />
      <Route path="/offer-skill" component={OfferSkill} />
      <Route path="/request-skill" component={RequestSkillPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
