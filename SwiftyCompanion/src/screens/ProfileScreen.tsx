import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/config';
import { User42 } from '../types/api';
import { apiClient } from '../services/api/client';

interface ProfileScreenProps {
  login: string;
  onBack: () => void;
}

export default function ProfileScreen({ login, onBack }: ProfileScreenProps) {
  const [user, setUser] = useState<User42 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [login]);

  const loadUserData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await apiClient.getUser(login);
      setUser(userData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('User not found')) {
        setError('Profile not found');
      } else if (errorMessage.includes('Authentication failed')) {
        setError('Authentication error - please check API credentials');
      } else {
        setError('Failed to load profile - please check your connection');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSkillPercentage = (level: number): number => {
    // Each level represents 100% until the next level
    // So level 4.25 = 425% total, but we want the percentage within the current level
    const currentLevelProgress = level % 1; // Gets the decimal part (0.25 in this example)
    return Math.round(currentLevelProgress * 100);
  };

  const getSkillBarWidth = (level: number): number => {
    // For the progress bar, we want to show progress within the current level
    const currentLevelProgress = level % 1;
    return currentLevelProgress * 100; // Convert to percentage for width
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.buttonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>😞</Text>
          </View>
          <Text style={styles.errorTitle}>{error}</Text>
          <Text style={styles.errorSubtitle}>
            The login "{login}"{' '}
            {error === 'Profile not found'
              ? 'does not exist'
              : 'could not be loaded'}
          </Text>

          {/* Only show Try Again for non-404 errors */}
          {error !== 'Profile not found' && (
            <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load user profile</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.buttonText}>Back to Search</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCursus = user.cursus_users?.[0];
  const skills = currentCursus?.skills || [];
  const projects = user.projects_users || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.buttonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image source={{ uri: user.image?.link }} style={styles.profileImage} />
        <Text style={styles.displayName}>{user.displayname}</Text>
        <Text style={styles.login}>@{user.login}</Text>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{user.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Level:</Text>
          <Text style={styles.detailValue}>
            {currentCursus?.level?.toFixed(2) || 'N/A'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{user.phone || 'Not provided'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>
            {user.location || 'Not available'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Wallet:</Text>
          <Text style={styles.detailValue}>{user.wallet} ₳</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Correction Points:</Text>
          <Text style={styles.detailValue}>{user.correction_point}</Text>
        </View>
      </View>

      <View style={styles.skillsSection}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {skills.length > 0 ? (
          skills.map((skill, index) => {
            const percentage = calculateSkillPercentage(skill.level);
            const barWidth = getSkillBarWidth(skill.level);

            return (
              <View key={index} style={styles.skillItem}>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <View style={styles.skillLevelContainer}>
                    <Text style={styles.skillLevel}>
                      Level {skill.level.toFixed(2)}
                    </Text>
                    <Text style={styles.skillPercentage}>({percentage}%)</Text>
                  </View>
                </View>
                <View style={styles.skillBar}>
                  <View
                    style={[styles.skillProgress, { width: `${barWidth}%` }]}
                  />
                </View>
                <View style={styles.skillDetails}>
                  <Text style={styles.skillDetailText}>
                    Progress to Level {Math.floor(skill.level) + 1}:{' '}
                    {percentage}%
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No skills data available</Text>
        )}
      </View>

      <View style={styles.projectsSection}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {projects.length > 0 ? (
          projects.slice(0, 10).map((project, index) => (
            <View key={index} style={styles.projectItem}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.project.name}</Text>
                <Text
                  style={[
                    styles.projectMark,
                    {
                      color:
                        project.final_mark === null
                          ? COLORS.textSecondary
                          : project['validated?']
                            ? COLORS.success
                            : COLORS.error,
                    },
                  ]}
                >
                  {project.final_mark ?? 'In progress'}
                </Text>
              </View>
              <Text style={styles.projectStatus}>
                {project['validated?'] === null
                  ? 'In progress'
                  : project['validated?']
                    ? 'Validated'
                    : 'Failed'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No projects data available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorIconText: {
    fontSize: 64,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  login: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  detailsSection: {
    margin: 20,
    padding: 15,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailLabel: {
    fontWeight: '600',
    color: COLORS.text,
  },
  detailValue: {
    color: COLORS.textSecondary,
  },
  skillsSection: {
    margin: 20,
    padding: 15,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  skillItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontWeight: '600',
    color: COLORS.text,
    fontSize: 16,
    flex: 1,
  },
  skillLevelContainer: {
    alignItems: 'flex-end',
  },
  skillLevel: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  skillPercentage: {
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: 12,
    marginTop: 2,
  },
  skillBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 5,
  },
  skillProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  skillDetails: {
    alignItems: 'center',
  },
  skillDetailText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  projectsSection: {
    margin: 20,
    padding: 15,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 40,
  },
  projectItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  projectName: {
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  projectMark: {
    fontWeight: 'bold',
  },
  projectStatus: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
