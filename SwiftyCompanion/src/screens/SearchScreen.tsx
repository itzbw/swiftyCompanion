import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/config';
import { apiClient } from '../services/api/client';

interface SearchScreenProps {
  onUserFound: (login: string) => void;
}

export default function SearchScreen({ onUserFound }: SearchScreenProps) {
  const [searchLogin, setSearchLogin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchLogin.trim()) {
      Alert.alert('Error', 'Please enter a login');
      return;
    }

    setIsLoading(true);
    try {
      // Always navigate to profile screen, even if user doesn't exist
      // ProfileScreen will handle the error display
      onUserFound(searchLogin.trim());
    } catch (error) {
      // This shouldn't happen since we're not awaiting the API call
      // But just in case, still navigate to profile screen
      onUserFound(searchLogin.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SwiftyCompanion</Text>
      <Text style={styles.subtitle}>Search for a 42 student</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter student login"
        value={searchLogin}
        onChangeText={setSearchLogin}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
        onSubmitEditing={handleSearch}
      />

      <TouchableOpacity
        style={[styles.searchButton, isLoading && styles.disabledButton]}
        onPress={handleSearch}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Search</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
