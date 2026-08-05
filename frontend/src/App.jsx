import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "./pages/Dashboard";
import { Route, Switch, Router as WouterRouter } from "wouter";
import Auth from "@/pages/Auth";
import Signup from "./pages/Signup";
import SkillExchange from "./pages/SkillExchange";
import OfferSkill from "./pages/OfferSkill";
<<<<<<< HEAD
import MySessions from "./pages/MySessions";
import NoticeBoard from "./pages/NoticeBoard";
import Calendar from "./pages/Calendar";
=======
import RequestSkillPage from "./pages/RequestSkillPage";
>>>>>>> 9a42c115e9f8b58d1286f185c87f0abae102b069

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/skill-exchange" component={SkillExchange} />
      <Route path="/offer-skill" component={OfferSkill} />
<<<<<<< HEAD
      <Route path="/my-sessions" component={MySessions} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/notice-board" component={NoticeBoard} />
      <Route path="/academic-hub" component={NoticeBoard} />
=======
      <Route path="/request-skill" component={RequestSkillPage} />
>>>>>>> 9a42c115e9f8b58d1286f185c87f0abae102b069
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;