import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAppInitialization } from "./hooks/useAppInitialization";
const App: React.FC = () => {
  useAppInitialization();

  return <AppRoutes />;
};

export default App;
