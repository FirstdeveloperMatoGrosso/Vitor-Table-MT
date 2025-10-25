import React, { useState } from 'react';
import { View } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ProductListScreen from './screens/ProductListScreen';
import OpenTablesScreen from './screens/OpenTablesScreen';
import BuyChipsScreen from './screens/BuyChipsScreen';
import SellProductScreen from './screens/SellProductScreen';
import { TableProvider } from './context/TableContext';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [user, setUser] = useState(null);
  const [screenParams, setScreenParams] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = window.localStorage.getItem('kioskFunctions');
      const isKioskMode = window.localStorage.getItem('isKioskMode') === 'true';
      if (stored && isKioskMode) {
        return {
          isKioskMode: true,
          kioskFunctions: JSON.parse(stored)
        };
      }
    } catch (error) {
      console.warn('Erro ao restaurar modo totem:', error);
    }
    return {};
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('isKioskMode', screenParams.isKioskMode ? 'true' : 'false');
      } catch (error) {
        console.warn('Erro ao salvar estado do modo totem:', error);
      }
    }
  }, [screenParams.isKioskMode]);

  const handleNavigate = (screen, params = {}) => {
    if (params.user) setUser(params);
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  return (
    <TableProvider>
      <View style={{ flex: 1 }}>
        {currentScreen === 'Home' && <HomeScreen onNavigate={handleNavigate} />}
        {currentScreen === 'Login' && <LoginScreen onNavigate={handleNavigate} screenParams={screenParams} />}
        {currentScreen === 'Products' && <ProductListScreen user={user} onNavigate={handleNavigate} screenParams={screenParams} />}
        {currentScreen === 'OpenTables' && <OpenTablesScreen onNavigate={handleNavigate} screenParams={screenParams} />}
        {currentScreen === 'BuyChips' && <BuyChipsScreen onNavigate={handleNavigate} screenParams={screenParams} />}
        {currentScreen === 'SellProduct' && (
          <SellProductScreen tableId={screenParams.tableId} onNavigate={handleNavigate} screenParams={screenParams} />
        )}
      </View>
    </TableProvider>
  );
}
