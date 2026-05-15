import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../shared/theme/colors';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop';

function WishlistItem({ item, onPress }) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={styles.itemContainer}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${item.name}`}
    >
      <Image
        source={{ uri: item.imageUrl || FALLBACK_IMAGE }}
        style={styles.image}
        defaultSource={{ uri: FALLBACK_IMAGE }}
      />
      <Text style={styles.itemName} numberOfLines={2}>
        {item.name}
      </Text>
    </Pressable>
  );
}

export function WishlistCarousel({ wishlist, onItemPress }) {
  const items = Array.isArray(wishlist) ? wishlist : [];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Wishlist</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>
          Like a place on Discover to save it here.
        </Text>
      ) : (
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <WishlistItem item={item} onPress={onItemPress} />
          )}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  itemContainer: {
    width: 130,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  itemName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
