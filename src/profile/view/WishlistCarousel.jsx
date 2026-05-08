import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../shared/theme/colors';

export function WishlistCarousel({ wishlist, onItemPress }) {
  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => onItemPress?.(item)}
      accessibilityRole="button"
      accessibilityLabel={`Open details for ${item.name}`}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
    </Pressable>
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
