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
import { COLORS, SPACING, GLOW_STYLES } from '../constants/config';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { apiClient } from '../services/api/client';

interface SearchScreenProps {
  onUserFound: (login: string) => void;
}

export default function SearchScreen({ onUserFound }: SearchScreenProps) {
  const [searchLogin, setSearchLogin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { deviceType, width } = useResponsive();

  const getContainerPadding = getResponsiveValue(
    SPACING.md,
    SPACING.lg,
    SPACING.xl
  );
  const getMaxWidth = getResponsiveValue(width, 500, 600);
  const getTitleSize = getResponsiveValue(28, 32, 36);
  const getSubtitleSize = getResponsiveValue(16, 18, 20);

  const handleSearch = async () => {
    if (!searchLogin.trim()) {
      Alert.alert('Error', 'Please enter a login');
      return;
    }

    setIsLoading(true);
    try {
      onUserFound(searchLogin.trim());
    } catch (error) {
      onUserFound(searchLogin.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicStyles = {
    container: {
      padding: getContainerPadding(deviceType),
    },
    contentContainer: {
      maxWidth: getMaxWidth(deviceType),
    },
    title: {
      fontSize: getTitleSize(deviceType),
    },
    subtitle: {
      fontSize: getSubtitleSize(deviceType),
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={[styles.contentContainer, dynamicStyles.contentContainer]}>
        <Text style={[styles.title, dynamicStyles.title]}>SwiftyCompanion</Text>
        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
          Search for a 42 student
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter student login"
          placeholderTextColor={COLORS.textSecondary}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.neonPink,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    textShadowColor: COLORS.glowPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
    lineHeight: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    ...GLOW_STYLES.violetGlow,
  },
  searchButton: {
    backgroundColor: COLORS.neonViolet,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
    ...GLOW_STYLES.neonGlow,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: COLORS.glowViolet,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});
