import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../config/colors';
import { businessConfig } from '../config/business';
import { getProductById, MobileProduct } from '../services/catalog';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { productId } = route.params || {};

  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<MobileProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      getProductById(productId)
        .then((p) => setProduct(p))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <LoadingSpinner message="Loading textile specifications..." />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product not found in catalogue.</Text>
          <Button
            title="Browse Products"
            onPress={() => navigation.navigate('ProductsTab')}
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    );
  }

  const stock = Number(product.stock_quantity ?? 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 20;

  // Build image list
  const images = product.product_images && product.product_images.length > 0
    ? product.product_images.map((img) => img.image_url)
    : product.image_url
    ? [product.image_url]
    : [];

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login', { returnTo: 'CartTab' });
      return;
    }
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        productCode: product.product_code,
        categoryName: product.category?.name || 'Wholesale Handloom',
        pricePerPiece: product.price_per_piece,
        imageUrl: product.image_url,
        stockQuantity: product.stock_quantity,
      },
      quantity
    );
    Alert.alert(
      'Added to Wholesale Cart',
      `${quantity} piece(s) of "${product.name}" added to cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('CartTab') },
      ]
    );
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `*SRI RAJA RAJESHWARA HANDLOOM — Wholesale Product Enquiry*\n\n` +
      `Product: ${product.name}\n` +
      `Code: ${product.product_code}\n` +
      `Category: ${product.category?.name || 'Textile'}\n` +
      `Fixed Rate: ₹${product.price_per_piece}/pc\n` +
      `Quantity Required: ${quantity} pieces\n\n` +
      `Please confirm piece rate availability and dispatch details.`
    );
    Linking.openURL(`https://wa.me/919440472939?text=${text}`).catch((err) =>
      console.warn('Could not open WhatsApp:', err)
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Back Row */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Products</Text>
        </TouchableOpacity>

        {/* Gallery / Image Display */}
        <View style={styles.imageBox}>
          {images.length > 0 ? (
            <Image
              source={{ uri: images[activeImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderBox}>
              <Ionicons name="shirt-outline" size={64} color={colors.accent} />
              <Text style={styles.placeholderText}>Authentic Handloom Weave</Text>
            </View>
          )}

          <View style={styles.badgeRow}>
            {isOutOfStock ? (
              <Badge label="Out of Stock" variant="danger" size="md" />
            ) : isLowStock ? (
              <Badge label={`Low Stock (${stock} pcs left)`} variant="warning" size="md" />
            ) : (
              <Badge label={`In Stock (${stock} pcs)`} variant="success" size="md" />
            )}
          </View>
        </View>

        {/* Image Thumbnails if multiple */}
        {images.length > 1 && (
          <ScrollView horizontal style={styles.thumbnailRow}>
            {images.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveImageIndex(idx)}
                style={[
                  styles.thumbnail,
                  activeImageIndex === idx && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri }} style={styles.thumbImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.categoryCodeRow}>
            <Text style={styles.categoryName}>
              {product.category?.name || 'Wholesale Handloom'}
            </Text>
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{product.product_code}</Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Pricing Highlight */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceSub}>WHOLESALE FIXED PIECE RATE</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceSymbol}>₹</Text>
                <Text style={styles.priceNumber}>{product.price_per_piece}</Text>
                <Text style={styles.priceUnit}> / piece</Text>
              </View>
            </View>

            <View style={styles.noMoqBadge}>
              <Ionicons name="infinite" size={14} color={colors.primary} />
              <Text style={styles.noMoqText}>Any Quantity Order</Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity (Pieces):</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.stepBtn}
              >
                <Ionicons name="remove" size={18} color={colors.charcoal} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.min(stock > 0 ? stock : 9999, q + 1))}
                style={styles.stepBtn}
              >
                <Ionicons name="add" size={18} color={colors.charcoal} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtotalPreview}>
              Subtotal: ₹{product.price_per_piece * quantity}
            </Text>
          </View>

          {/* CTA Actions */}
          <View style={styles.ctaRow}>
            <Button
              title="Add to Cart"
              icon="cart-outline"
              variant="primary"
              size="lg"
              disabled={isOutOfStock}
              onPress={handleAddToCart}
              style={styles.ctaBtn}
            />
            <Button
              title="WhatsApp Enquiry"
              icon="logo-whatsapp"
              variant="whatsapp"
              size="lg"
              onPress={openWhatsApp}
              style={styles.ctaBtn}
            />
          </View>
        </View>

        {/* Product Description */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Textile Description & Specifications</Text>
          <Text style={styles.descriptionText}>
            {product.description ||
              'Traditional wholesale textile produced on authentic handlooms and powerlooms. Designed for high commercial utility, consistent finish, and fast retail sales.'}
          </Text>

          <View style={styles.specTable}>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Pricing Model</Text>
              <Text style={styles.specVal}>Single Fixed Wholesale Piece Rate</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Product Code / SKU</Text>
              <Text style={styles.specVal}>{product.product_code}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Minimum Order</Text>
              <Text style={styles.specVal}>Any Quantity Allowed (No Minimum)</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Supply Terms</Text>
              <Text style={styles.specVal}>100% Wholesale / B2B Commercial Only</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Dispatch Hub</Text>
              <Text style={styles.specVal}>Nizamabad Godown, Telangana</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  backText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  imageBox: {
    height: 260,
    backgroundColor: colors.surfaceSubtle,
    position: 'relative',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  thumbnailRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginRight: 8,
  },
  thumbnailActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  categoryCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    color: colors.accentHover,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  codeBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.charcoal,
    lineHeight: 24,
    marginBottom: 14,
  },
  priceContainer: {
    backgroundColor: colors.primarySubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(13, 59, 46, 0.15)',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceSub: {
    fontSize: 9,
    color: colors.primaryLight,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  priceSymbol: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  priceNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  priceUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  noMoqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noMoqText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
  },
  stepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.charcoal,
    minWidth: 32,
    textAlign: 'center',
  },
  subtotalPreview: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  ctaRow: {
    gap: 10,
  },
  ctaBtn: {
    width: '100%',
  },
  detailsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 16,
  },
  specTable: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  specKey: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  notFound: {
    padding: 36,
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 15,
    color: colors.muted,
  },
});
