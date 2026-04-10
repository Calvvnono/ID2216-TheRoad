import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../shared/theme/colors';
import { StatusOverlay } from '../../shared/ui/StatusOverlay';
import { JourneysPresenter } from '../presenter/JourneysPresenter';
import { JourneyCard } from './JourneyCard';
import { AddJourneyModal } from './AddJourneyModal';

const EMPTY_FORM = {
  destination: '',
  country: '',
  startDate: '',
  endDate: '',
  spent: '',
  places: '',
  visitedLocations: '',
  dailyExpenses: '',
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

export const JourneysScreen = observer(function JourneysScreen() {
  const router = useRouter();
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    JourneysPresenter.init();
  }, []);

  const loadStatus = JourneysPresenter.getLoadStatus();
  const errorMessage = JourneysPresenter.getErrorMessage();
  const createStatus = JourneysPresenter.getCreateStatus();
  const createErrorMessage = JourneysPresenter.getCreateErrorMessage();
  const journeys = JourneysPresenter.getJourneys();

  useEffect(() => {
    if (createStatus === 'success') {
      setAddModalVisible(false);
      setForm(EMPTY_FORM);
      JourneysPresenter.resetCreateState();
    }
  }, [createStatus]);

  const openAddModal = () => {
    JourneysPresenter.resetCreateState();
    setForm(EMPTY_FORM);
    setAddModalVisible(true);
  };

  const closeAddModal = () => {
    if (createStatus === 'loading') return;
    JourneysPresenter.resetCreateState();
    setAddModalVisible(false);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      updateField('localPhotoUris', selectedUris);
    } catch (e) {
      Alert.alert(
        'Unable to open album',
        e?.message || 'Please try again.',
      );
    }
  };

  const submitNewJourney = () => {
    JourneysPresenter.onCreateJourney(form);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          The Road Goes Ever On
        </Text>
        <Text style={styles.headerSubtitle}>All the World's a Road</Text>
      </View>

      <Text style={styles.pageTitle}>My Journeys</Text>
      <Text style={styles.pageSubtitle}>Tap a journey to view details</Text>

      <StatusOverlay
        status={loadStatus}
        errorMessage={errorMessage}
        onRetry={() => JourneysPresenter.reload()}
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
        form={form}
        createStatus={createStatus}
        createErrorMessage={createErrorMessage}
        onChangeField={updateField}
        onPickPhotos={pickPhotosFromAlbum}
        onClose={closeAddModal}
        onSubmit={submitNewJourney}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pageTitle: {
    marginTop: 18,
    fontSize: 40,
    fontWeight: '300',
    color: Colors.textPrimary,
  },
  pageSubtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 16,
    color: Colors.textSecondary,
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
