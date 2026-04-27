import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { JourneyDetailPresenter } from '../presenter/JourneyDetailPresenter';
import { AddJourneyModal } from './AddJourneyModal';

const HERO_STORY_INTERVAL_MS = 1400;
const EMPTY_EDIT_FORM = {
  destination: '',
  country: '',
  startDate: '',
  endDate: '',
  spent: '',
  places: '',
  visitedLocations: '',
  dailyExpenses: '',
  existingPhotoUrls: [],
  localPhotoUris: [],
};

function toCommaSeparatedText(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return list.join(', ');
}

function createEditForm(journey) {
  if (!journey) return EMPTY_EDIT_FORM;
  return {
    destination: journey.destination || '',
    country: journey.country || '',
    startDate: journey.startDate || '',
    endDate: journey.endDate || '',
    spent: String(journey.spent ?? ''),
    places: String(journey.places ?? ''),
    visitedLocations: toCommaSeparatedText(journey.visitedLocations),
    dailyExpenses: toCommaSeparatedText(journey.dailyExpenses),
    existingPhotoUrls: Array.isArray(journey.photoMemories)
      ? journey.photoMemories.filter(Boolean)
      : [],
    localPhotoUris: [],
  };
}

function resolveImageMediaTypes() {
  if (ImagePicker.MediaTypeOptions?.Images !== undefined) {
    return ImagePicker.MediaTypeOptions.Images;
  }
  if (ImagePicker.MediaType?.Images) {
    return [ImagePicker.MediaType.Images];
  }
  return ['images'];
}

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
  const [isHeroStoryPlaying, setHeroStoryPlaying] = useState(false);
  const [heroFrameIndex, setHeroFrameIndex] = useState(0);
  const [previewPhotoUri, setPreviewPhotoUri] = useState('');
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
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
  const updateStatus = JourneyDetailPresenter.getUpdateStatus();
  const updateErrorMessage = JourneyDetailPresenter.getUpdateErrorMessage();
  const journey = JourneyDetailPresenter.getJourneyById(journeyId);
  const visitedLocations = journey?.visitedLocations || [];
  const dailyExpenses = journey?.dailyExpenses || [];
  const photoMemories = journey?.photoMemories || [];

  const heroStoryFrames = useMemo(() => {
    const memories = Array.isArray(journey?.photoMemories)
      ? journey.photoMemories.filter(Boolean)
      : [];
    const fallback = [journey?.detailHeroImage, journey?.imageUrl].filter(Boolean);
    const frames = memories.length ? memories : fallback;
    return frames.length ? frames : [''];
  }, [journey?.id, journey?.detailHeroImage, journey?.imageUrl, journey?.photoMemories]);

  const canPlayHeroStory = heroStoryFrames.length > 1;
  const currentHeroFrame = heroStoryFrames[heroFrameIndex] || journey?.detailHeroImage || '';

  useEffect(() => {
    setHeroStoryPlaying(false);
    setHeroFrameIndex(0);
    setPreviewVisible(false);
    setPreviewPhotoUri('');
    setEditModalVisible(false);
    JourneyDetailPresenter.resetUpdateState();
  }, [journey?.id, heroStoryFrames.length]);

  useEffect(() => {
    if (updateStatus === 'success') {
      setEditModalVisible(false);
      JourneyDetailPresenter.resetUpdateState();
    }
  }, [updateStatus]);

  useEffect(() => {
    if (!isHeroStoryPlaying || heroStoryFrames.length < 2) {
      return undefined;
    }

    const timer = setInterval(() => {
      setHeroFrameIndex((prev) => (prev + 1) % heroStoryFrames.length);
    }, HERO_STORY_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [isHeroStoryPlaying, heroStoryFrames.length]);

  const toggleHeroStoryPlayback = () => {
    if (!canPlayHeroStory) return;
    setHeroStoryPlaying((prev) => !prev);
  };

  const openPhotoPreview = (uri) => {
    if (!uri) return;
    setPreviewPhotoUri(uri);
    setPreviewVisible(true);
  };

  const closePhotoPreview = () => {
    setPreviewVisible(false);
  };

  const openEditModal = () => {
    if (!journey) return;
    if (!journey.isPersisted) {
      Alert.alert('Edit unavailable', 'Only uploaded journeys can be edited.');
      return;
    }
    JourneyDetailPresenter.resetUpdateState();
    setEditForm(createEditForm(journey));
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    if (updateStatus === 'loading') return;
    JourneyDetailPresenter.resetUpdateState();
    setEditModalVisible(false);
  };

  const updateEditField = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const appendEditLocalPhotos = (photoUris) => {
    if (!Array.isArray(photoUris) || !photoUris.length) return;
    setEditForm((prev) => ({
      ...prev,
      localPhotoUris: [...prev.localPhotoUris, ...photoUris],
    }));
  };

  const removeExistingPhotoAt = (index) => {
    setEditForm((prev) => ({
      ...prev,
      existingPhotoUrls: prev.existingPhotoUrls.filter((_, i) => i !== index),
    }));
  };

  const removeLocalPhotoAt = (index) => {
    setEditForm((prev) => ({
      ...prev,
      localPhotoUris: prev.localPhotoUris.filter((_, i) => i !== index),
    }));
  };

  const pickEditPhotosFromAlbum = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo permission required',
          'Please allow photo library access, then tap Add Photos again.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: resolveImageMediaTypes(),
        allowsMultipleSelection: true,
        quality: 0.75,
      });

      if (result.canceled || !result.assets?.length) return;
      const selectedUris = result.assets
        .map((asset) => asset?.uri)
        .filter(Boolean);

      if (!selectedUris.length) return;
      appendEditLocalPhotos(selectedUris);
    } catch (e) {
      Alert.alert('Unable to open album', e?.message || 'Please try again.');
    }
  };

  const submitJourneyUpdate = () => {
    if (!journey) return;
    JourneyDetailPresenter.onUpdateJourney({
      id: journey.id,
      ...editForm,
    });
  };

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

        <Pressable style={styles.iconBtn} onPress={openEditModal}>
          <Ionicons name="create-outline" size={18} color={Colors.textPrimary} />
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
                <Image source={{ uri: currentHeroFrame }} style={styles.heroImage} />
                <View style={styles.heroOverlay} />
                <Pressable
                  style={[
                    styles.playBtn,
                    !canPlayHeroStory && styles.playBtnDisabled,
                  ]}
                  onPress={toggleHeroStoryPlayback}
                  disabled={!canPlayHeroStory}
                >
                  <Ionicons
                    name={isHeroStoryPlaying ? 'pause' : 'play'}
                    size={26}
                    color={Colors.textPrimary}
                  />
                </Pressable>
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
                    <Pressable
                      key={`${journey.id}-memory-${index}`}
                      onPress={() => openPhotoPreview(url)}
                      style={styles.memoryImagePress}
                    >
                      <Image
                        source={{ uri: url }}
                        style={styles.memoryImage}
                      />
                    </Pressable>
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

      <Modal
        visible={isPreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={closePhotoPreview}
      >
        <View style={styles.previewBackdrop}>
          <Pressable style={styles.previewCloseBtn} onPress={closePhotoPreview}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>

          {previewPhotoUri ? (
            <Image
              source={{ uri: previewPhotoUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>

      <AddJourneyModal
        visible={isEditModalVisible}
        mode="edit"
        form={editForm}
        submitStatus={updateStatus}
        submitErrorMessage={updateErrorMessage}
        onChangeField={updateEditField}
        onPickPhotos={pickEditPhotosFromAlbum}
        onRemoveExistingPhoto={removeExistingPhotoAt}
        onRemoveLocalPhoto={removeLocalPhotoAt}
        onClose={closeEditModal}
        onSubmit={submitJourneyUpdate}
      />
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
  playBtnDisabled: {
    opacity: 0.55,
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
  memoryImagePress: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  memoryImage: {
    width: 170,
    height: 95,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 22, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 56,
    right: 22,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  previewImage: {
    width: '100%',
    height: '72%',
    borderRadius: 10,
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
