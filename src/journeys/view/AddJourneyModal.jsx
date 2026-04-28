import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Colors } from '../../shared/theme/colors';

function Field({ label, value, placeholder, onChangeText, keyboardType = 'default' }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export function AddJourneyModal({
  visible,
  form,
  mode = 'create',
  submitStatus,
  submitErrorMessage,
  onChangeField,
  onPickPhotos,
  onRemoveExistingPhoto,
  onRemoveLocalPhoto,
  onClose,
  onSubmit,
}) {
  const actionStatus = submitStatus || 'idle';
  const actionErrorMessage = submitErrorMessage;
  const isSaving = actionStatus === 'loading';
  const selectedLocalPhotoUris = Array.isArray(form.localPhotoUris)
    ? form.localPhotoUris
    : [];
  const selectedExistingPhotoUrls = Array.isArray(form.existingPhotoUrls)
    ? form.existingPhotoUrls
    : [];
  const selectedPhotoCount = selectedExistingPhotoUrls.length + selectedLocalPhotoUris.length;
  const isEditMode = mode === 'edit';
  const titleText = isEditMode ? 'Edit Journey' : 'Add New Journey';
  const pickPhotosText = isEditMode ? 'Add Photos from Album' : 'Select Photos from Album';
  const submitText = isEditMode ? 'Save Changes' : 'Upload Journey';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{titleText}</Text>
            <Pressable style={styles.closeBtn} onPress={onClose} disabled={isSaving}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.helperText}>Required: destination, country, dates, and at least one photo.</Text>

            <Field
              label="Destination"
              value={form.destination}
              placeholder="Tokyo"
              onChangeText={(v) => onChangeField('destination', v)}
            />
            <Field
              label="Country"
              value={form.country}
              placeholder="Japan"
              onChangeText={(v) => onChangeField('country', v)}
            />
            <Field
              label="Start Date"
              value={form.startDate}
              placeholder="YYYY-MM-DD"
              onChangeText={(v) => onChangeField('startDate', v)}
            />
            <Field
              label="End Date"
              value={form.endDate}
              placeholder="YYYY-MM-DD"
              onChangeText={(v) => onChangeField('endDate', v)}
            />

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Trip Photos</Text>
              <Pressable
                style={styles.photoPickerBtn}
                onPress={onPickPhotos}
                disabled={isSaving}
              >
                <Text style={styles.photoPickerBtnText}>{pickPhotosText}</Text>
              </Pressable>
              <Text style={styles.photoCountText}>
                {selectedPhotoCount} photo(s) selected
              </Text>

              {selectedPhotoCount > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.previewRow}
                >
                  {selectedExistingPhotoUrls.map((uri, index) => (
                    <View key={`existing-preview-${index}`} style={styles.previewItem}>
                      <Image
                        source={{ uri }}
                        style={styles.previewImage}
                      />
                      <Pressable
                        style={styles.removePhotoBtn}
                        onPress={() => onRemoveExistingPhoto?.(index)}
                        disabled={isSaving}
                      >
                        <Text style={styles.removePhotoBtnText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}

                  {selectedLocalPhotoUris.map((uri, index) => (
                    <View key={`local-preview-${index}`} style={styles.previewItem}>
                      <Image
                        source={{ uri }}
                        style={styles.previewImage}
                      />
                      <Pressable
                        style={styles.removePhotoBtn}
                        onPress={() => onRemoveLocalPhoto?.(index)}
                        disabled={isSaving}
                      >
                        <Text style={styles.removePhotoBtnText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              ) : null}
            </View>

            <Field
              label="Total Spent"
              value={form.spent}
              placeholder="2450"
              keyboardType="numeric"
              onChangeText={(v) => onChangeField('spent', v)}
            />
            <Field
              label="Place Count"
              value={form.places}
              placeholder="18"
              keyboardType="numeric"
              onChangeText={(v) => onChangeField('places', v)}
            />
            <Field
              label="Visited Locations (comma separated)"
              value={form.visitedLocations}
              placeholder="Shibuya, Shinjuku, Asakusa"
              onChangeText={(v) => onChangeField('visitedLocations', v)}
            />
            <Field
              label="Daily Expenses (comma separated)"
              value={form.dailyExpenses}
              placeholder="280,340,420,300"
              onChangeText={(v) => onChangeField('dailyExpenses', v)}
            />

            <Text style={styles.sectionLabel}>BGM Matching Preferences (optional)</Text>
            <Field
              label="Mood Tags (comma separated)"
              value={form.bgmMoodTags}
              placeholder="chill, cinematic, nostalgic"
              onChangeText={(v) => onChangeField('bgmMoodTags', v)}
            />
            <Field
              label="Activity Tags (comma separated)"
              value={form.bgmActivityTags}
              placeholder="roadtrip, citywalk, beach"
              onChangeText={(v) => onChangeField('bgmActivityTags', v)}
            />
            <Field
              label="Preferred Genres (comma separated)"
              value={form.bgmPreferredGenres}
              placeholder="indie pop, lofi, house"
              onChangeText={(v) => onChangeField('bgmPreferredGenres', v)}
            />
            <Field
              label="Custom Keywords (comma separated)"
              value={form.bgmCustomKeywords}
              placeholder="sunset, neon, mountain"
              onChangeText={(v) => onChangeField('bgmCustomKeywords', v)}
            />
            <Field
              label="Energy Level (1-5)"
              value={form.bgmEnergyLevel}
              placeholder="3"
              keyboardType="numeric"
              onChangeText={(v) => onChangeField('bgmEnergyLevel', v)}
            />

            {actionErrorMessage ? (
              <Text style={styles.errorText}>{actionErrorMessage}</Text>
            ) : null}

            <View style={styles.footerRow}>
              <Pressable style={styles.cancelBtn} onPress={onClose} disabled={isSaving}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={onSubmit} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color={Colors.textInverse} />
                ) : (
                  <Text style={styles.submitBtnText}>{submitText}</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  helperText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
  sectionLabel: {
    marginTop: 4,
    marginBottom: 6,
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  fieldWrap: {
    marginBottom: 10,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
  },
  photoPickerBtn: {
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  photoPickerBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  photoCountText: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  previewRow: {
    marginTop: 8,
    gap: 8,
    paddingRight: 10,
  },
  previewItem: {
    width: 64,
    height: 64,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceLight,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoBtnText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  errorText: {
    marginTop: 4,
    color: Colors.danger,
    fontSize: 13,
  },
  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.surfaceLight,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1.3,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.primary,
  },
  submitBtnText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
});
