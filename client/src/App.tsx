
import { Toaster } from "@/components/ui/sonner"; // Toast notifications
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { useState } from "react";

function Router() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/services"} component={Services} />
      <Route path={"/contact"} component={Contact} />
      
      {/* Admin Routes */}
      <Route path={"/admin"}>
        {isAdminLoggedIn ? (
          <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />
        ) : (
          <AdminLogin 
            onLoginSuccess={() => setIsAdminLoggedIn(true)} 
            onCancel={() => window.location.href = "/"} 
          />
        )}
      </Route>

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
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
