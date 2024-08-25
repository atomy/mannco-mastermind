import { useEffect, useState } from 'react';
import { fetchAndActivate, getString } from 'firebase/remote-config';
import remoteConfig from './firebase-config';

const useRemoteConfigHook = () => {
  const [weaponsDbConfig, setWeaponsDbConfig] = useState('{}');
  const [isWeaponsDbConfigLoading, setIsWeaponsDbConfigLoading] =
    useState(true);
  const [weaponDbConfigError, setWeaponDbConfigError] = useState<unknown>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        await fetchAndActivate(remoteConfig);
        const weaponsDbJson = getString(remoteConfig, 'weapondb');
        setWeaponsDbConfig(weaponsDbJson);
      } catch (err: unknown) {
        setWeaponDbConfigError(err);
      } finally {
        setIsWeaponsDbConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { weaponsDbConfig, isWeaponsDbConfigLoading, weaponDbConfigError };
};

export default useRemoteConfigHook;
