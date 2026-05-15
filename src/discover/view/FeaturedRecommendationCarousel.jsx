import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../shared/theme/colors';

const CARD_HEIGHT = 340;

export function FeaturedRecommendationCarousel({
  places,
  onCardPress,
  onLike,
  onUnlike,
}) {
  const screenW = Dimensions.get('window').width;
  const CARD_W = screenW - 40;
  const [index, setIndex] = useState(0);

  const renderItem = ({ item }) => (
    <View style={{ width: screenW, alignItems: 'center' }}>
      <View style={[styles.card, { width: CARD_W, height: CARD_HEIGHT }]}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <Pressable
          style={styles.detailTapZone}
          onPress={() => onCardPress?.(item)}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${item.name}`}
        />

        <View style={styles.bottomContent} pointerEvents="box-none">
          <Text style={styles.heroTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.countryText} numberOfLines={1}>
            {item.country}
          </Text>
          <View style={styles.matchBox}>
            <View style={styles.matchDot} />
            <Text style={styles.matchText} numberOfLines={2}>
              {item.overlayLine ?? item.reason}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.btnPass}
              onPress={() => onUnlike?.(item)}
              disabled={item.isToggling}
              accessibilityLabel="Remove from wishlist"
            >
              <Text style={styles.btnPassIcon}>✕</Text>
            </Pressable>
            <Pressable
              style={[styles.btnHeart, item.heartActive && styles.btnHeartActive]}
              onPress={() => onLike?.(item)}
              disabled={item.isToggling}
              accessibilityLabel="Save to wishlist"
            >
              <Ionicons
                name={item.heartIconName}
                size={24}
                color={Colors.primary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  if (!places.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No recommendations yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.carouselWrapper}>
        <FlatList
          data={places}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          snapToInterval={screenW}
          snapToAlignment="start"
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            setIndex(Math.round(x / screenW));
          }}
          getItemLayout={(_, i) => ({
            length: screenW,
            offset: screenW * i,
            index: i,
          })}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.dots}>
        {places.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 4,
  },
  carouselWrapper: {
    marginHorizontal: -20,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 5 },
    }),
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  detailTapZone: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  countryText: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 2,
    marginBottom: 8,
  },
  matchBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(20, 24, 41, 0.78)',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 14,
  },
  matchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 5,
    flexShrink: 0,
  },
  matchText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  btnPass: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.dismissBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  btnPassIcon: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  btnHeart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
    }),
  },
  btnHeartActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 16,
  },
  emptyWrap: {
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
