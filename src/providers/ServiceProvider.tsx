import React, { createContext, useContext, ReactNode } from "react";
import { ITranslationService } from "../services/ITranslationService";
import { TranslationService } from "../services/TranslationService";

interface ServiceProviderProps {
  children: ReactNode;
  translationService?: ITranslationService;
}

const ServiceContext = createContext<{
  translationService: ITranslationService;
} | null>(null);

export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  translationService = new TranslationService(),
}) => {
  return <ServiceContext.Provider value={{ translationService }}>{children}</ServiceContext.Provider>;
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
};
