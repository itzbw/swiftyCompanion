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
import { COLORS, SPACING, GLOW_STYLES } from '../constants/config';
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
  const getMaxWidth = getResponsiveValue(width, width * 0.95, 1000);
  const getColumnsCount = getResponsiveValue(1, 2, 2);

  // Move ALL useMemo hooks to the top, before any conditional returns
  const currentCursus = React.useMemo(() => {
    console.log('🔍 EXTRACTING CURSUS - user state:', !!user);
    console.log('🔍 cursus_users available:', user?.cursus_users?.length || 0);

    if (!user?.cursus_users || user.cursus_users.length === 0) {
      console.log('🔍 NO CURSUS DATA AVAILABLE');
      return null;
    }

    // Find the most relevant cursus
    let selectedCursus = user.cursus_users.find(
      cursus =>
        cursus.cursus?.name?.toLowerCase().includes('42') ||
        cursus.cursus?.slug?.toLowerCase().includes('42cursus')
    );

    if (!selectedCursus) {
      selectedCursus = user.cursus_users.reduce((prev, current) =>
        (current.level || 0) > (prev.level || 0) ? current : prev
      );
    }

    if (!selectedCursus) {
      selectedCursus = user.cursus_users[0];
    }

    console.log('🔍 Selected cursus level:', selectedCursus?.level);
    console.log(
      '🔍 Selected cursus skills:',
      selectedCursus?.skills?.length || 0
    );

    return selectedCursus;
  }, [user]);

  const skills = React.useMemo(() => {
    console.log('🔍 EXTRACTING SKILLS from cursus:', !!currentCursus);

    if (!currentCursus?.skills) {
      console.log('🔍 NO SKILLS AVAILABLE');
      return [];
    }

    console.log('🔍 SKILLS FOUND:', currentCursus.skills.length);
    return currentCursus.skills;
  }, [currentCursus]);

  const projects = React.useMemo(() => {
    console.log('🔍 EXTRACTING PROJECTS:', user?.projects_users?.length || 0);
    return user?.projects_users || [];
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [login]);

  const loadUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading user data for:', login);
      const userData = await apiClient.getUser(login);

      // Add a small delay to ensure all data is properly received
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('🔍 SETTING USER DATA:');
      console.log('- cursus_users:', userData.cursus_users?.length || 0);
      console.log('- projects_users:', userData.projects_users?.length || 0);

      setUser(userData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ LoadUserData error:', errorMessage);

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

  const dynamicStyles = StyleSheet.create({
    container: {
      paddingHorizontal: getSectionPadding(deviceType),
    },
    contentContainer: {
      maxWidth: getMaxWidth(deviceType),
      alignSelf: 'center' as const,
      width: '100%',
    },
    profileImage: {
      width: getImageSize(deviceType),
      height: getImageSize(deviceType),
      borderRadius: getImageSize(deviceType) / 2,
    },
  });

  console.log('🔍 FINAL EXTRACTION RESULTS:');
  console.log('- skills:', skills.length);
  console.log('- projects:', projects.length);

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
          <Text style={styles.displayName}>{user.usual_full_name}</Text>
          <Text style={styles.login}>@{user.login}</Text>
        </View>

        {/* Desktop/Tablet: New layout - Details + Skills on left, Big Projects on right */}
        {isTablet || isDesktop ? (
          <View style={styles.twoColumnLayout}>
            <View style={styles.leftColumn}>
              {/* Details Section */}
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

              {/* Compact Skills Section */}
              <View style={styles.skillsSectionCompact}>
                <Text style={styles.sectionTitleSmall}>Skills</Text>
                {skills.length > 0 ? (
                  skills.map((skill, index) => {
                    const percentage = calculateSkillPercentage(skill.level);
                    const barWidth = getSkillBarWidth(skill.level);

                    return (
                      <View key={index} style={styles.skillItemCompact}>
                        <View style={styles.skillHeaderCompact}>
                          <Text style={styles.skillNameCompact}>
                            {skill.name}
                          </Text>
                          <Text style={styles.skillLevelCompact}>
                            Lv {Math.floor(skill.level)} (
                            {calculateSkillPercentage(skill.level)}%)
                          </Text>
                        </View>
                        <View style={styles.skillBarCompact}>
                          <View
                            style={[
                              styles.skillProgressCompact,
                              { width: `${barWidth}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.skillPercentageText}>
                          {skill.level.toFixed(2)} /{' '}
                          {Math.floor(skill.level) + 1}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noDataTextSmall}>
                    No skills data available
                  </Text>
                )}
              </View>
            </View>

            {/* Right Column - Expanded Projects */}
            <View style={styles.rightColumnExpanded}>
              <View style={styles.projectsSectionExpanded}>
                <Text style={styles.sectionTitleLarge}>
                  Projects ({projects.length})
                </Text>
                {projects.length > 0 ? (
                  <ScrollView
                    style={styles.projectsScrollViewExpanded}
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
                        <View key={index} style={styles.projectItemExpanded}>
                          <View style={styles.projectHeaderExpanded}>
                            <Text style={styles.projectNameExpanded}>
                              {project.project.name}
                            </Text>
                            <View style={styles.projectScoreContainer}>
                              <Text
                                style={[
                                  styles.projectMarkExpanded,
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
                          </View>
                          <View style={styles.projectMetaData}>
                            <Text style={styles.projectStatusExpanded}>
                              Status:{' '}
                              {project['validated?'] === null
                                ? 'In progress'
                                : project['validated?']
                                  ? 'Validated ✅'
                                  : 'Failed ❌'}
                            </Text>
                            {project.marked_at && (
                              <Text style={styles.projectDateExpanded}>
                                📅 Completed:{' '}
                                {new Date(
                                  project.marked_at
                                ).toLocaleDateString()}
                              </Text>
                            )}
                          </View>
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
          /* Mobile: Stacked layout with big projects first */
          <>
            {/* Mobile Details */}
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

            {/* Mobile Projects - Big Card */}
            <View style={styles.projectsSectionMobile}>
              <Text style={styles.sectionTitleLarge}>
                Projects ({projects.length})
              </Text>
              {projects.length > 0 ? (
                <ScrollView
                  style={styles.projectsScrollViewMobile}
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
                      <View key={index} style={styles.projectItemMobile}>
                        <View style={styles.projectHeaderMobile}>
                          <Text style={styles.projectNameMobile}>
                            {project.project.name}
                          </Text>
                          <Text
                            style={[
                              styles.projectMarkMobile,
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
                        <Text style={styles.projectStatusMobile}>
                          {project['validated?'] === null
                            ? '🔄 In progress'
                            : project['validated?']
                              ? '✅ Validated'
                              : '❌ Failed'}
                        </Text>
                        {project.marked_at && (
                          <Text style={styles.projectDateMobile}>
                            📅{' '}
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

            {/* Mobile Skills - Compact */}
            <View style={styles.skillsSectionMobile}>
              <Text style={styles.sectionTitle}>Skills</Text>
              {skills.length > 0 ? (
                <View style={styles.skillsGrid}>
                  {skills.map((skill, index) => {
                    const percentage = calculateSkillPercentage(skill.level);
                    const barWidth = getSkillBarWidth(skill.level);

                    return (
                      <View key={index} style={styles.skillItemGrid}>
                        <Text style={styles.skillNameGrid}>{skill.name}</Text>
                        <Text style={styles.skillLevelGrid}>
                          Level {Math.floor(skill.level)} -{' '}
                          {calculateSkillPercentage(skill.level)}%
                        </Text>
                        <View style={styles.skillBarGrid}>
                          <View
                            style={[
                              styles.skillProgressGrid,
                              { width: `${barWidth}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.skillDetailGrid}>
                          {skill.level.toFixed(2)} /{' '}
                          {Math.floor(skill.level) + 1}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.noDataText}>No skills data available</Text>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  ); // <- This closing parenthesis and semicolon were likely missing
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
    color: COLORS.neonPink,
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: COLORS.glowPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
    color: COLORS.neonPink,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    textShadowColor: COLORS.glowPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
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
    backgroundColor: COLORS.neonViolet,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
    ...GLOW_STYLES.violetGlow,
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
    gap: SPACING.md,
  },
  leftColumn: {
    flex: 0.4, // Smaller for details + skills
  },
  rightColumnExpanded: {
    flex: 0.6, // Bigger for projects
  },
  profileSection: {
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surfaceAccent,
    marginHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
    ...GLOW_STYLES.neonGlow,
  },
  profileImage: {
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.neonPink,
    ...GLOW_STYLES.neonGlow,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textShadowColor: COLORS.glowPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  login: {
    fontSize: 16,
    color: COLORS.neonViolet,
    fontWeight: '600',
    textShadowColor: COLORS.glowViolet,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  detailsSection: {
    margin: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...GLOW_STYLES.violetGlow,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neonPink,
    marginBottom: SPACING.md,
    textAlign: 'center',
    textShadowColor: COLORS.glowPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  sectionTitleSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.neonViolet,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    textShadowColor: COLORS.glowViolet,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  sectionTitleLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neonPink,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    textShadowColor: COLORS.glowPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
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
    color: COLORS.neonViolet,
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  skillsSectionCompact: {
    margin: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...GLOW_STYLES.cyanGlow,
  },
  skillItemCompact: {
    marginBottom: SPACING.sm,
    padding: SPACING.xs,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.neonPink,
  },
  skillHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  skillNameCompact: {
    fontWeight: '600',
    color: COLORS.text,
    fontSize: 13,
    flex: 1,
  },
  skillLevelCompact: {
    color: COLORS.neonPink,
    fontWeight: 'bold',
    fontSize: 12,
  },
  skillBarCompact: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  skillProgressCompact: {
    height: '100%',
    backgroundColor: COLORS.neonPink,
    borderRadius: 2,
  },
  projectsSectionExpanded: {
    margin: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
    minHeight: 600,
    ...GLOW_STYLES.neonGlow,
  },
  projectsScrollViewExpanded: {
    maxHeight: 950,
  },
  projectItemExpanded: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
    ...GLOW_STYLES.violetGlow,
  },
  projectHeaderExpanded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  projectNameExpanded: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 18,
    flex: 1,
    textShadowColor: COLORS.glowPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  projectScoreContainer: {
    backgroundColor: COLORS.surfaceAccent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  projectMarkExpanded: {
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: COLORS.glowPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  projectMetaData: {
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  projectStatusExpanded: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  projectDateExpanded: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Mobile Projects Styles
  projectsSectionMobile: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
    maxHeight: 400,
    ...GLOW_STYLES.neonGlow,
  },
  projectsScrollViewMobile: {
    maxHeight: 300,
  },
  projectItemMobile: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  projectHeaderMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  projectNameMobile: {
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
  },
  projectMarkMobile: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  projectStatusMobile: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  projectDateMobile: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  // Mobile Skills Grid
  skillsSectionMobile: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xxl,
    ...GLOW_STYLES.cyanGlow,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  skillItemGrid: {
    width: '48%',
    padding: SPACING.xs,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.neonPink,
  },
  skillNameGrid: {
    fontWeight: '600',
    color: COLORS.text,
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  skillLevelGrid: {
    color: COLORS.neonViolet,
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: SPACING.xs,
  },
  skillBarGrid: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  skillProgressGrid: {
    height: '100%',
    backgroundColor: COLORS.neonPink,
    borderRadius: 2,
  },
  backButton: {
    backgroundColor: COLORS.neonViolet,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
    ...GLOW_STYLES.violetGlow,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: COLORS.glowViolet,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  noDataText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SPACING.lg,
  },
  noDataTextSmall: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SPACING.sm,
    fontSize: 12,
  },
  skillPercentageText: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  skillDetailGrid: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
});
