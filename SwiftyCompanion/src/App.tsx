import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from './constants/config';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';

export default function App() {
  const [currentView, setCurrentView] = useState<'search' | 'profile'>(
    'search'
  );
  const [selectedLogin, setSelectedLogin] = useState<string>('');

  const handleUserFound = (login: string) => {
    setSelectedLogin(login);
    setCurrentView('profile');
  };

  const handleBack = () => {
    setCurrentView('search');
    setSelectedLogin('');
  };

  return (
    <View style={styles.container}>
      {currentView === 'search' ? (
        <SearchScreen onUserFound={handleUserFound} />
      ) : (
        <ProfileScreen login={selectedLogin} onBack={handleBack} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
