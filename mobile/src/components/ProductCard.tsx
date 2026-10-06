import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { Badge } from './Badge';
import { MobileProduct } from '../services/catalog';

interface ProductCardProps {
  product: MobileProduct;
  onPress: () => void;
  onAddToCart: () => void;
}

export function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  const stock = Number(product.stock_quantity ?? 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 20;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      {/* Product Image Area */}
      <View style={styles.imageContainer}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="shirt-outline" size={36} color={colors.accent} />
            <Text style={styles.placeholderText}>100% Cotton Handloom</Text>
          </View>
        )}

        <View style={styles.badgeOverlay}>
          {isOutOfStock ? (
            <Badge label="Out of Stock" variant="danger" size="sm" />
          ) : isLowStock ? (
            <Badge label={`Low Stock (${stock})`} variant="warning" size="sm" />
          ) : (
            <Badge label="In Stock" variant="success" size="sm" />
          )}
        </View>
      </View>

      {/* Product Details Area */}
      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {product.category?.name || 'Handloom Textiles'}
          </Text>
          <Text style={styles.skuText} numberOfLines={1}>
            {product.product_code}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Pricing Box - Strictly 1 Fixed Piece Rate */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.pieceRateLabel}>Wholesale Fixed Rate</Text>
            <View style={styles.priceValueRow}>
              <Text style={styles.priceSymbol}>₹</Text>
              <Text style={styles.priceAmount}>{product.price_per_piece}</Text>
              <Text style={styles.priceUnit}> / piece</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onAddToCart}
            disabled={isOutOfStock}
            style={[
              styles.addBtn,
              isOutOfStock && styles.addBtnDisabled,
            ]}
          >
            <Ionicons
              name="cart-outline"
              size={18}
              color={isOutOfStock ? '#9CA3AF' : colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    height: 160,
    backgroundColor: colors.surfaceSubtle,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
  },
  placeholderText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  content: {
    padding: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    color: colors.accentHover,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  skuText: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  pieceRateLabel: {
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  priceSymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  priceUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
