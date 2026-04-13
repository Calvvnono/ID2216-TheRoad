import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  PanResponder,
} from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  CommonStyles,
} from '../../shared/theme';
import ExpenseChart from './ExpenseChart';
import SheetQuickStat from './SheetQuickStat';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

/**
 * Bottom sheet showing details for a selected location.
 * Uses RN Modal + Animated instead of @gorhom/bottom-sheet
 * so it works in Expo Go without native worklets.
 * Props from HubScreen (HubPresenter).
 */
function LocationSheet({ selectedLocationName: selectedName, selectedLocation: location, onSheetDismiss }) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (selectedName) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT);
    }
  }, [selectedName, slideAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideAnim.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.5) {
          Animated.timing(slideAnim, {
            toValue: SHEET_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onSheetDismiss());
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!location) return null;

  return (
    <Modal
      visible={!!location}
      transparent
      animationType="none"
      onRequestClose={onSheetDismiss}
    >
      <TouchableWithoutFeedback onPress={onSheetDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.handleZone}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.country}>{location.country}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onSheetDismiss}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <SheetQuickStat label="Visits" value={location.visitCount} color={Colors.primary} />
            <SheetQuickStat label="Days" value={location.totalDays} color={Colors.secondary} />
            <SheetQuickStat
              label="Spent"
              value={`$${location.totalSpent.toLocaleString()}`}
              color={Colors.tertiary}
            />
          </View>

          <View style={CommonStyles.divider} />

          <ExpenseChart expensesByCategory={location.expensesByCategory} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
  },
  handleZone: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.textTertiary,
  },
  content: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: Spacing.xxxxl,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationName: {
    ...Typography.pageTitle,
    color: Colors.textPrimary,
  },
  country: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
});

export default LocationSheet;
