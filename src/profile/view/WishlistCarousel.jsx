import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { Colors } from '../../shared/theme/colors';

/**
 * Pure view — horizontal wishlist image carousel.
 * Data comes via props; no direct persistence access.
 */
export function WishlistCarousel({ wishlist }) {
  const renderItem = ({ item }) => (
    <Image source={{ uri: item.imageUrl }} style={styles.image} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>My Wishlist</Text>
      <FlatList
        data={wishlist}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
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
  image: {
    width: 130,
    height: 130,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
});
