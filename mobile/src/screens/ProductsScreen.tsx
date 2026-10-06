import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../config/colors';
import { WHOLESALE_CATEGORIES } from '../config/categories';
import { getProducts, MobileProduct } from '../services/catalog';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function ProductsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    route.params?.categorySlug || 'all'
  );
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sync category if navigated from categories tab with parameter
  useEffect(() => {
    if (route.params?.categorySlug) {
      setSelectedCategory(route.params.categorySlug);
    }
  }, [route.params?.categorySlug]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const prods = await getProducts({
        categorySlug: selectedCategory === 'all' ? undefined : selectedCategory,
        search: search.trim() || undefined,
        sortBy,
      });
      setProducts(prods);
    } catch (err) {
      console.warn('Error loading products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = () => {
    loadProducts();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by product name, code (e.g. SRR-TWL)..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(''); loadProducts(); }}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Pills Slider */}
      <View style={styles.pillsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
        >
          <TouchableOpacity
            style={[
              styles.pill,
              selectedCategory === 'all' && styles.pillActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategory === 'all' && styles.pillTextActive,
              ]}
            >
              All Categories
            </Text>
          </TouchableOpacity>

          {WHOLESALE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                selectedCategory === cat.slug && styles.pillActive,
              ]}
              onPress={() => setSelectedCategory(cat.slug)}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedCategory === cat.slug && styles.pillTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Bar */}
      <View style={styles.filterBar}>
        <Text style={styles.countText}>
          {products.length} {products.length === 1 ? 'Product' : 'Products'} Available
        </Text>

        <View style={styles.sortOptions}>
          <TouchableOpacity
            onPress={() =>
              setSortBy((prev) =>
                prev === 'newest' ? 'price-asc' : prev === 'price-asc' ? 'price-desc' : 'newest'
              )
            }
            style={styles.sortBtn}
          >
            <Ionicons name="swap-vertical" size={14} color={colors.primary} />
            <Text style={styles.sortText}>
              {sortBy === 'newest'
                ? 'Newest'
                : sortBy === 'price-asc'
                ? 'Price: Low → High'
                : 'Price: High → Low'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {loading ? (
          <LoadingSpinner message="Loading wholesale catalogue..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No Products Found"
            description="No wholesale textiles matched your current filter criteria."
            actionTitle="Reset Filters"
            onAction={() => {
              setSelectedCategory('all');
              setSearch('');
            }}
          />
        ) : (
          products.map((product) => (
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  searchContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.charcoal,
    paddingVertical: 0,
  },
  pillsContainer: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pillsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal,
  },
  pillTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surfaceSubtle,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
