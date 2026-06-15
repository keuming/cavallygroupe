import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import Home from "./pages/Home";
import ProductCatalog from "./pages/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import AdminDashboard from "./pages/AdminDashboard";
import SupplyListUpload from "./pages/SupplyListUpload";
import CategoryPage from "./pages/CategoryPage";
import { RecruitmentForm } from "./pages/RecruitmentForm";
import { TutorsList } from "./pages/TutorsList";
import { BecomeTutorForm } from "./pages/BecomeTutorForm";
import { CheckoutCart } from "./pages/CheckoutCart";
import { CheckoutShipping } from "./pages/CheckoutShipping";
import { CheckoutPayment } from "./pages/CheckoutPayment";
import { CheckoutConfirmation } from "./pages/CheckoutConfirmation";
import { Account } from "./pages/Account";
import QRCodeGenerator from "./pages/QRCodeGenerator";
import { PWAPrompt } from "./components/PWAPrompt";
import AccountTypeSelection from "./pages/AccountTypeSelection";
import CustomerDashboard from "./pages/CustomerDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import { LiveShoppingPage } from "./pages/LiveShoppingPage";
import { QuickOrderPage } from "./pages/QuickOrderPage";
import EducationCategoryPage from "./pages/EducationCategoryPage";
import OrderManagementDashboard from "./pages/OrderManagementDashboard";
import { OrdersManagementPage } from "./pages/OrdersManagementPage";
import AdvancedSupplyListManagement from "./pages/AdvancedSupplyListManagement";
import { EducationClass } from "./pages/EducationClass";
import AdminProductsManagement from "./pages/AdminProductsManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Composant de redirection pour les utilisateurs non-admin
function AdminRedirect() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else if (user?.role !== 'admin') {
      navigate("/");
    }
  }, [isAuthenticated, user]);
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-gray-600">Accès refusé. Redirection...</p>
        </div>
      </div>
    );
  }
  
  return <AdminDashboard />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />

      <Route path={"/products"} component={ProductCatalog} />
      <Route path={"/product/:id"} component={ProductDetail} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/order-confirmation"} component={OrderConfirmation} />
      <Route path={"/order-confirmation/:orderNumber"} component={OrderConfirmation} />
      <Route path={"/track-order"} component={OrderTracking} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/dashboard"} component={AdminDashboard} />
      <Route path={"/supply-list-upload"} component={SupplyListUpload} />
      <Route path={"/category/:id"} component={(props: any) => <CategoryPage categoryId={Number(props.params.id)} />} />
      <Route path={"/soutien-scolaire"} component={RecruitmentForm} />
      <Route path={"/petites-annonces/repetiteurs"} component={TutorsList} />
      <Route path={"/petites-annonces/devenir-repetiteur"} component={BecomeTutorForm} />
      <Route path={"/checkout/cart"} component={CheckoutCart} />
      <Route path={"/checkout/shipping"} component={CheckoutShipping} />
      <Route path={"/checkout/payment"} component={CheckoutPayment} />
      <Route path={"/checkout/confirmation"} component={CheckoutConfirmation} />
      <Route path={"/account"} component={Account} />
      <Route path={"/admin/qrcode"} component={QRCodeGenerator} />
      <Route path={"/account-type-selection"} component={AccountTypeSelection} />
      <Route path={"/customer-dashboard"} component={CustomerDashboard} />
      <Route path={"/vendor-dashboard"} component={VendorDashboard} />
      <Route path={"/live-shopping"} component={LiveShoppingPage} />
      <Route path={"/quick-order"} component={QuickOrderPage} />
      <Route path={"/education/:levelId"} component={EducationCategoryPage} />
      <Route path={"/education/:levelId/:sublevelId"} component={EducationCategoryPage} />
      <Route path={"/admin/orders"} component={OrderManagementDashboard} />
      <Route path={"/admin/orders-management"} component={OrdersManagementPage} />
      <Route path={"/admin/products"} component={AdminProductsManagement} />
      <Route path={"/supply-list-management"} component={AdvancedSupplyListManagement} />
      <Route path={"/education-class/:classId"} component={(props: any) => <EducationClass {...props} />} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <PWAPrompt />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
