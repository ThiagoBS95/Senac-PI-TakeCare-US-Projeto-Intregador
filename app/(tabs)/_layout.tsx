import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // O aplicativo tem uma única tela de entrada: a barra de abas não se justifica.
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
    </Tabs>
  );
}
