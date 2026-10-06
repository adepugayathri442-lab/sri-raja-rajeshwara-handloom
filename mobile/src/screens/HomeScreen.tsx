import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../config/colors';
import { businessConfig } from '../config/business';
import { WHOLESALE_CATEGORIES } from '../config/categories';
import { getProducts, MobileProduct } from '../services/catalog';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<MobileProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const prods = await getProducts();
      setFeaturedProducts(prods.slice(0, 6));
    } catch (e) {
      console.warn('Error loading home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openWhatsApp = () => {
    Linking.openURL(businessConfig.contact.whatsappLink).catch((err) =>
      console.warn('Failed to open WhatsApp:', err)
    );
  };

  const handleAddToCart = (product: MobileProduct) => {
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
      1
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* B2B Trust Banner */}
        <View style={styles.topTrustBanner}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
            <Text style={styles.trustText}>100% Wholesale</Text>
          </View>
          <Text style={styles.trustDot}>•</Text>
          <View style={styles.trustItem}>
            <Ionicons name="pricetag" size={13} color={colors.accent} />
            <Text style={styles.trustText}>Fixed Piece Rates</Text>
          </View>
          <Text style={styles.trustDot}>•</Text>
          <View style={styles.trustItem}>
            <Ionicons name="airplane" size={13} color={colors.accent} />
            <Text style={styles.trustText}>Pan-India Dispatch</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroBadgeRow}>
            <Badge label="B2B Wholesale Only" variant="accent" size="sm" />
            <Badge label="Direct Godown Supply" variant="primary" size="sm" />
          </View>

          <Text style={styles.heroTitle}>
            Authentic Wholesale Textiles for Businesses Across India
          </Text>

          <Text style={styles.heroSubtitle}>
            Quality traditional textiles supplied to shops, businesses and bulk buyers at wholesale prices.
          </Text>

          <View style={styles.heroActionRow}>
            <Button
              title="Explore Products"
              icon="grid-outline"
              variant="primary"
              onPress={() => navigation.navigate('ProductsTab')}
              style={styles.heroBtn}
            />
            <Button
              title="WhatsApp Enquiry"
              icon="logo-whatsapp"
              variant="whatsapp"
              onPress={openWhatsApp}
              style={styles.heroBtn}
            />
          </View>
        </View>

        {/* Wholesale Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionSub}>B2B Textile Weaves</Text>
              <Text style={styles.sectionTitle}>Wholesale Categories (12)</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('CategoriesTab')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {WHOLESALE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryTile}
                activeOpacity={0.75}
                onPress={() =>
                  navigation.navigate('ProductsTab', { categorySlug: cat.slug })
                }
              >
                <View style={styles.categoryIconCircle}>
                  <Ionicons name={cat.iconName as any} size={20} color={colors.primary} />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {cat.name}
                </Text>
                <Text style={styles.categoryCount}>Fixed Piece Rate</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products from REAL Supabase Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionSub}>Direct From Looms</Text>
              <Text style={styles.sectionTitle}>Featured Wholesale Catalogue</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductsTab')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.viewAllText}>All Products →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <LoadingSpinner message="Fetching real Supabase products..." />
          ) : featuredProducts.length === 0 ? (
            <View style={styles.emptyFeatured}>
              <Ionicons name="cube-outline" size={32} color={colors.accent} />
              <Text style={styles.emptyFeaturedText}>Catalog updating from warehouse.</Text>
            </View>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() =>
                  navigation.navigate('ProductDetail', { productId: product.id })
                }
                onAddToCart={() => handleAddToCart(product)}
              />
            ))
          )}
        </View>

        {/* Why Choose Us Section */}
        <View style={styles.whyChooseCard}>
          <View style={styles.whyChooseHeader}>
            <Text style={styles.whyChooseBadge}>Merchant Advantages</Text>
            <Text style={styles.whyChooseTitle}>Why Retailers & Resellers Trust Us</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="checkmark-done-circle" size={20} color={colors.accent} />
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureHeading}>100% Wholesale Exclusively</Text>
              <Text style={styles.featureDesc}>
                We cater strictly to commercial cloth shops, resellers, and institutions with no retail markups.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="pricetags" size={20} color={colors.accent} />
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureHeading}>Single Fixed Piece Rates</Text>
              <Text style={styles.featureDesc}>
                Order any quantity with transparent per-piece pricing. No artificial bundle traps or MOQ hurdles.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="bus" size={20} color={colors.accent} />
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureHeading}>Pan-India Freight Logistics</Text>
              <Text style={styles.featureDesc}>
                Prompt transport & parcel dispatch with LR consignment tracking to any state or union territory.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="logo-whatsapp" size={20} color={colors.accent} />
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureHeading}>Direct WhatsApp Godown Support</Text>
              <Text style={styles.featureDesc}>
                Talk directly to our wholesale merchants for bale booking and custom order requirements.
              </Text>
            </View>
          </View>
        </View>

        {/* Merchant Godown Contact Card */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Official Godown & Dispatch Hub</Text>
          <Text style={styles.contactAddress}>
            {businessConfig.contact.fullAddress}
          </Text>
          <Text style={styles.contactPhone}>
            Direct Line: {businessConfig.contact.formattedPhone}
          </Text>
          <Text style={styles.contactHours}>
            Dispatch Hours: {businessConfig.contact.workingHours}
          </Text>

          <Button
            title="Chat on WhatsApp (+91 94404 72939)"
            icon="logo-whatsapp"
            variant="whatsapp"
            onPress={openWhatsApp}
            style={{ marginTop: 14 }}
          />
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
    paddingBottom: 28,
  },
  topTrustBanner: {
    backgroundColor: colors.primaryHover,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  trustDot: {
    color: colors.accent,
    fontSize: 10,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 28,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 19,
    marginBottom: 20,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtn: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionSub: {
    fontSize: 10,
    color: colors.accentHover,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentHover,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryTile: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  emptyFeatured: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFeaturedText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
  },
  whyChooseCard: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  whyChooseHeader: {
    marginBottom: 16,
  },
  whyChooseBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentHover,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  whyChooseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 12,
  },
  featureIcon: {
    marginTop: 2,
  },
  featureBody: {
    flex: 1,
  },
  featureHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
  },
  contactCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  contactAddress: {
    fontSize: 12,
    color: colors.charcoal,
    lineHeight: 17,
    marginBottom: 6,
  },
  contactPhone: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  contactHours: {
    fontSize: 11,
    color: colors.muted,
  },
});
