import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import OpenTablesScreen from './src/screens/OpenTablesScreen';
import BuyChipsScreen from './src/screens/BuyChipsScreen';
import SellProductScreen from './src/screens/SellProductScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [user, setUser] = useState(null);
  const [screenParams, setScreenParams] = useState({});

  const handleNavigate = (screen, params = {}) => {
    if (params.user) setUser(params);
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  return (
    <>
      <StatusBar style="dark" />
      {currentScreen === 'Home' && <HomeScreen onNavigate={handleNavigate} />}
      {currentScreen === 'Login' && <LoginScreen onNavigate={handleNavigate} />}
      {currentScreen === 'Products' && <ProductListScreen user={user} onNavigate={handleNavigate} />}
      {currentScreen === 'OpenTables' && <OpenTablesScreen onNavigate={handleNavigate} />}
      {currentScreen === 'BuyChips' && <BuyChipsScreen onNavigate={handleNavigate} />}
      {currentScreen === 'SellProduct' && <SellProductScreen table={screenParams.table} onNavigate={handleNavigate} />}
    </>
  );
}
