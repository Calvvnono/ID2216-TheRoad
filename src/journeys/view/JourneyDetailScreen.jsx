import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Animated,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { JourneyDetailPresenter } from '../presenter/JourneyDetailPresenter';

function DailyExpenseBars({ values }) {
  const max = values.length > 0 ? Math.max(...values) : 1;

  return (
    <View style={styles.chartRow}>
      {values.map((value, index) => (
        <View key={`day-${index}`} style={styles.chartItem}>
          <View style={styles.chartTrack}>
            <View
              style={[
                styles.chartBar,
                {
                  height: `${(value / max) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.chartDay}>Day {index + 1}</Text>
        </View>
      ))}
    </View>
  );
}

export const JourneyDetailScreen = observer(function JourneyDetailScreen() {
  const router = useRouter();
  const entryAnim = useRef(new Animated.Value(0)).current;
  const params = useLocalSearchParams();
  const journeyIdParam = Array.isArray(params.journeyId)
    ? params.journeyId[0]
    : params.journeyId;
  const journeyId = typeof journeyIdParam === 'string' ? journeyIdParam : '';

  useEffect(() => {
    JourneyDetailPresenter.init();
  }, []);

  useEffect(() => {
    entryAnim.setValue(0);
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [entryAnim, journeyId]);

  const handleBack = useCallback(() => {
    if (typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/journeys');
  }, [router]);

  const detailAnimatedStyle = {
    opacity: entryAnim,
    transform: [
      {
        translateY: entryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  const loadStatus = JourneyDetailPresenter.getLoadStatus();
  const errorMessage = JourneyDetailPresenter.getErrorMessage();
  const journey = JourneyDetailPresenter.getJourneyById(journeyId);
  const visitedLocations = journey?.visitedLocations || [];
  const dailyExpenses = journey?.dailyExpenses || [];
  const photoMemories = journey?.photoMemories || [];

  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <Pressable style={styles.iconBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </Pressable>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{journey?.destination || 'Journey Detail'}</Text>
          <Text style={styles.subtitle}>{journey?.travelDates || ''}</Text>
        </View>

        <Pressable style={styles.iconBtn}>
          <Ionicons name="share-social-outline" size={18} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <StatusOverlay
        status={loadStatus}
        errorMessage={errorMessage}
        onRetry={() => JourneyDetailPresenter.reload()}
      >
        {journey ? (
          <Animated.View style={[styles.detailContainer, detailAnimatedStyle]}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroWrap}>
                <Image source={{ uri: journey.detailHeroImage }} style={styles.heroImage} />
                <View style={styles.heroOverlay} />
                <View style={styles.playBtn}>
                  <Ionicons name="play" size={26} color={Colors.textPrimary} />
                </View>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Visited Locations</Text>
                </View>
                <View style={styles.tagRow}>
                  {visitedLocations.map((place, index) => (
                    <View key={`${place}-${index}`} style={styles.tagChip}>
                      <Text style={styles.tagText}>{`${index + 1}. ${place}`}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Daily Expenses</Text>
                <DailyExpenseBars values={dailyExpenses} />
              </View>

              <View style={styles.memoriesSection}>
                <Text style={styles.sectionTitle}>Photo Memories</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.memoryRow}
                >
                  {photoMemories.map((url, index) => (
                    <Image
                      key={`${journey.id}-memory-${index}`}
                      source={{ uri: url }}
                      style={styles.memoryImage}
                    />
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          </Animated.View>
        ) : (
          <View style={styles.notFoundWrap}>
            <Text style={styles.notFoundText}>Journey not found.</Text>
            <Pressable style={styles.notFoundButton} onPress={handleBack}>
              <Text style={styles.notFoundButtonText}>Back to Journeys</Text>
            </Pressable>
          </View>
        )}
      </StatusOverlay>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  titleBlock: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 1,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  detailContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  heroWrap: {
    height: 210,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 26, 0.28)',
  },
  playBtn: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 68,
    height: 68,
    borderRadius: 34,
    marginLeft: -34,
    marginTop: -34,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    marginTop: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: Colors.textPrimary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  chartRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  chartItem: {
    flex: 1,
    alignItems: 'center',
  },
  chartTrack: {
    width: '100%',
    height: 110,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: Colors.primary,
    minHeight: 4,
  },
  chartDay: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  memoriesSection: {
    marginTop: 14,
  },
  memoryRow: {
    marginTop: 8,
    gap: 10,
    paddingRight: 10,
  },
  memoryImage: {
    width: 170,
    height: 95,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface,
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  notFoundButton: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  notFoundButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textInverse,
  },
});
