import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { JourneyCard } from './JourneyCard';
import { AddJourneyModal } from './AddJourneyModal';

const APP_HEADER_LOGO = require('../../shared/assets/logo_pic.png');

const HEADER_LOGO_TOP = 10;
const HEADER_LOGO_SIZE = 80;
const TITLE_BELOW_LOGO = HEADER_LOGO_TOP + HEADER_LOGO_SIZE + 8;

const EMPTY_FORM = {
  destination: '',
  country: '',
  startDate: '',
  endDate: '',
  spent: '',
  places: '',
  visitedLocations: '',
  dailyExpenses: '',
  bgmMoodTags: '',
  bgmActivityTags: '',
  bgmPreferredGenres: '',
  bgmCustomKeywords: '',
  bgmEnergyLevel: '',
  localPhotoUris: [],
};

function resolveImageMediaTypes() {
  if (ImagePicker.MediaTypeOptions?.Images !== undefined) {
    return ImagePicker.MediaTypeOptions.Images;
  }
  if (ImagePicker.MediaType?.Images) {
    return [ImagePicker.MediaType.Images];
  }
  return ['images'];
}

export function JourneysScreen({
  loadStatus,
  errorMessage,
  createStatus,
  createErrorMessage,
  journeys,
  onInit,
  onReload,
  onCreateJourney,
  onResetCreateState,
}) {
  const router = useRouter();
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    onInit();
  }, [onInit]);

  useEffect(() => {
    if (createStatus === 'success') {
      setAddModalVisible(false);
      setForm(EMPTY_FORM);
      onResetCreateState();
    }
  }, [createStatus, onResetCreateState]);

  const openAddModal = () => {
    onResetCreateState();
    setForm(EMPTY_FORM);
    setAddModalVisible(true);
  };

  const closeAddModal = () => {
    if (createStatus === 'loading') return;
    onResetCreateState();
    setAddModalVisible(false);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const appendLocalPhotos = (photoUris) => {
    if (!Array.isArray(photoUris) || photoUris.length < 1) return;
    setForm((prev) => ({
      ...prev,
      localPhotoUris: [...prev.localPhotoUris, ...photoUris],
    }));
  };

  const removeLocalPhotoAt = (index) => {
    setForm((prev) => ({
      ...prev,
      localPhotoUris: prev.localPhotoUris.filter((_, i) => i !== index),
    }));
  };

  const pickPhotosFromAlbum = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo permission required',
          'Please allow photo library access, then tap Select Photos again.',
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
      appendLocalPhotos(selectedUris);
    } catch (e) {
      Alert.alert(
        'Unable to open album',
        e?.message || 'Please try again.',
      );
    }
  };

  const submitNewJourney = () => {
    onCreateJourney(form);
  };

  return (
    <View style={styles.screen}>
      <Image source={APP_HEADER_LOGO} style={styles.floatingLogo} resizeMode="contain" />

      <Text style={styles.pageTitle}>My Journeys</Text>
      <Text style={styles.pageSubtitle}>Tap a journey to view details</Text>

      <StatusOverlay
        status={loadStatus}
        errorMessage={errorMessage}
        onRetry={onReload}
      >
        <FlatList
          data={journeys}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <JourneyCard
              journey={item}
              onPress={(journeyId) => {
                router.push({
                  pathname: '/journeyDetail',
                  params: { journeyId },
                });
              }}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No journeys yet.</Text>
          }
        />
      </StatusOverlay>

      <Pressable style={styles.addFab} onPress={openAddModal}>
        <Text style={styles.addFabText}>+</Text>
      </Pressable>

      <AddJourneyModal
        visible={isAddModalVisible}
        mode="create"
        form={form}
        submitStatus={createStatus}
        submitErrorMessage={createErrorMessage}
        onChangeField={updateField}
        onPickPhotos={pickPhotosFromAlbum}
        onRemoveLocalPhoto={removeLocalPhotoAt}
        onClose={closeAddModal}
        onSubmit={submitNewJourney}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  floatingLogo: {
    position: 'absolute',
    top: HEADER_LOGO_TOP,
    left: 20,
    width: HEADER_LOGO_SIZE,
    height: HEADER_LOGO_SIZE,
    zIndex: 20,
  },
  pageTitle: {
    marginTop: TITLE_BELOW_LOGO,
    fontSize: 40,
    fontWeight: '300',
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
  pageSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
  listContent: {
    paddingBottom: 110,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
  },
  addFab: {
    position: 'absolute',
    right: 16,
    bottom: 98,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderMedium,
  },
  addFabText: {
    fontSize: 34,
    lineHeight: 34,
    color: Colors.textInverse,
    fontWeight: '400',
    marginTop: -2,
  },
});
