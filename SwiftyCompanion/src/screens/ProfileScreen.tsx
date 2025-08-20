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
import { COLORS, SPACING } from '../constants/config';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
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
  const { deviceType, width, isTablet, isDesktop } = useResponsive();

  const getSectionPadding = getResponsiveValue(
    SPACING.md,
    SPACING.lg,
    SPACING.xl
  );
  const getImageSize = getResponsiveValue(120, 140, 160);
  const getMaxWidth = getResponsiveValue(width, 600, 800);
  const getColumnsCount = getResponsiveValue(1, 2, 2);

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
    const currentLevelProgress = level % 1;
    return Math.round(currentLevelProgress * 100);
  };

  const getSkillBarWidth = (level: number): number => {
    const currentLevelProgress = level % 1;
    return currentLevelProgress * 100;
  };

  const dynamicStyles = {
    container: {
      paddingHorizontal: getSectionPadding(deviceType),
    },
    contentContainer: {
      maxWidth: getMaxWidth(deviceType),
      alignSelf: 'center' as const,
    },
    profileImage: {
      width: getImageSize(deviceType),
      height: getImageSize(deviceType),
      borderRadius: getImageSize(deviceType) / 2,
    },
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
        <View style={[styles.header, dynamicStyles.container]}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.buttonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.errorContainer, dynamicStyles.contentContainer]}>
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
      <View style={[styles.header, dynamicStyles.container]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.buttonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.contentWrapper, dynamicStyles.contentContainer]}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user.image?.link }}
            style={[styles.profileImage, dynamicStyles.profileImage]}
          />
          <Text style={styles.displayName}>{user.displayname}</Text>
          <Text style={styles.login}>@{user.login}</Text>
        </View>

        {/* Desktop/Tablet: Two columns layout */}
        {isTablet || isDesktop ? (
          <View style={styles.twoColumnLayout}>
            <View style={styles.leftColumn}>
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
                  <Text style={styles.detailValue}>
                    {user.phone || 'Not provided'}
                  </Text>
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
                  <Text style={styles.detailValue}>
                    {user.correction_point}
                  </Text>
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
                            <Text style={styles.skillPercentage}>
                              ({percentage}%)
                            </Text>
                          </View>
                        </View>
                        <View style={styles.skillBar}>
                          <View
                            style={[
                              styles.skillProgress,
                              { width: `${barWidth}%` },
                            ]}
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
                  <Text style={styles.noDataText}>
                    No skills data available
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.rightColumn}>
              <View style={styles.projectsSection}>
                <Text style={styles.sectionTitle}>
                  Projects ({projects.length})
                </Text>
                {projects.length > 0 ? (
                  <ScrollView
                    style={styles.projectsScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {projects
                      .sort((a, b) => {
                        if (a.marked_at && b.marked_at) {
                          return (
                            new Date(b.marked_at).getTime() -
                            new Date(a.marked_at).getTime()
                          );
                        }
                        if (a.marked_at && !b.marked_at) return -1;
                        if (!a.marked_at && b.marked_at) return 1;
                        return a.project.name.localeCompare(b.project.name);
                      })
                      .map((project, index) => (
                        <View key={index} style={styles.projectItem}>
                          <View style={styles.projectHeader}>
                            <Text style={styles.projectName}>
                              {project.project.name}
                            </Text>
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
                          {project.marked_at && (
                            <Text style={styles.projectDate}>
                              Completed:{' '}
                              {new Date(project.marked_at).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                      ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.noDataText}>
                    No projects data available
                  </Text>
                )}
              </View>
            </View>
          </View>
        ) : (
          /* Mobile: Single column layout */
          <>
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
                <Text style={styles.detailValue}>
                  {user.phone || 'Not provided'}
                </Text>
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

            <View style={styles.projectsSection}>
              <Text style={styles.sectionTitle}>
                Projects ({projects.length})
              </Text>
              {projects.length > 0 ? (
                <ScrollView
                  style={styles.projectsScrollView}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {projects
                    .sort((a, b) => {
                      if (a.marked_at && b.marked_at) {
                        return (
                          new Date(b.marked_at).getTime() -
                          new Date(a.marked_at).getTime()
                        );
                      }
                      if (a.marked_at && !b.marked_at) return -1;
                      if (!a.marked_at && b.marked_at) return 1;
                      return a.project.name.localeCompare(b.project.name);
                    })
                    .map((project, index) => (
                      <View key={index} style={styles.projectItem}>
                        <View style={styles.projectHeader}>
                          <Text style={styles.projectName}>
                            {project.project.name}
                          </Text>
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
                        {project.marked_at && (
                          <Text style={styles.projectDate}>
                            Completed:{' '}
                            {new Date(project.marked_at).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    ))}
                </ScrollView>
              ) : (
                <Text style={styles.noDataText}>
                  No projects data available
                </Text>
              )}
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
                          <Text style={styles.skillPercentage}>
                            ({percentage}%)
                          </Text>
                        </View>
                      </View>
                      <View style={styles.skillBar}>
                        <View
                          style={[
                            styles.skillProgress,
                            { width: `${barWidth}%` },
                          ]}
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
          </>
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
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorIcon: {
    marginBottom: SPACING.lg,
  },
  errorIconText: {
    fontSize: 64,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
  },
  contentWrapper: {
    width: '100%',
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileImage: {
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  login: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  detailsSection: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  detailValue: {
    color: COLORS.textSecondary,
    flex: 2,
    textAlign: 'right',
  },
  skillsSection: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xxl,
  },
  skillItem: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: SPACING.xs,
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
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 500,
  },
  projectsScrollView: {
    maxHeight: 400,
  },
  projectItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceSecondary,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
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
  projectDate: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
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
    textAlign: 'center',
    padding: SPACING.lg,
  },
});
