import React, { createContext, useContext } from 'react';
import useRemoteConfigHook from './useRemoteConfigHook';

// Define the shape of the context data
interface RemoteConfigContextProps {
  weaponsDbConfig: string;
  isWeaponsDbConfigLoading: boolean;
  weaponDbConfigError: unknown;
}

// Create the context with an undefined initial value
const RemoteConfigContext = createContext<RemoteConfigContextProps | undefined>(
  undefined,
);

// Define the provider component
export const RemoteConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { weaponsDbConfig, isWeaponsDbConfigLoading, weaponDbConfigError } =
    useRemoteConfigHook();

  return (
    <RemoteConfigContext.Provider
      value={{ weaponsDbConfig, isWeaponsDbConfigLoading, weaponDbConfigError }}
    >
      {children}
    </RemoteConfigContext.Provider>
  );
};

// Custom hook to use the Remote Config context
export const useRemoteConfig = (): RemoteConfigContextProps => {
  const context = useContext(RemoteConfigContext);
  if (!context) {
    throw new Error(
      'useRemoteConfig must be used within a RemoteConfigProvider',
    );
  }
  return context;
};
