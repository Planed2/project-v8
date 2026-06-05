import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import SelecaoTurmas from "./pages/SelecaoTurmas";
import DashboardEscola from "./pages/DashboardEscola";
import RegistroInfrequencia from "./pages/RegistroInfrequencia";
import PainelAdministrativo from "./pages/PainelAdministrativo";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/selecao-turmas" component={SelecaoTurmas} />
      <Route path="/dashboard-escola" component={DashboardEscola} />
      <Route path="/registro-infrequencia" component={RegistroInfrequencia} />
      <Route path="/painel-administrativo" component={PainelAdministrativo} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
