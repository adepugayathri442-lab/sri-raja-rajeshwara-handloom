import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { colors } from '../config/colors';
import { WHOLESALE_CATEGORIES, CATEGORY_GROUPS } from '../config/categories';

export function CategoriesScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleBox}>
          <Text style={styles.subTitle}>DIRECT HANDLOOM & POWERLOOM WEAVES</Text>
          <Text style={styles.title}>Wholesale Textile Categories</Text>
          <Text style={styles.desc}>
            Fixed piece rates across all traditional classifications. Supplying retail cloth stores and institutional buyers across India.
          </Text>
        </View>

        {CATEGORY_GROUPS.map((group) => {
          const groupCats = WHOLESALE_CATEGORIES.filter((c) => c.groupName === group);

          return (
            <View key={group} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group}</Text>
                <Text style={styles.groupCount}>{groupCats.length} Categories</Text>
              </View>

              <View style={styles.categoryList}>
                {groupCats.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.card}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate('ProductsTab', { categorySlug: cat.slug })
                    }
                  >
                    <View style={styles.iconCircle}>
                      <Ionicons name={cat.iconName as any} size={22} color={colors.primary} />
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.cardTitleRow}>
                        <Text style={styles.cardName}>{cat.name}</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                      </View>
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {cat.description}
                      </Text>
                      <View style={styles.highlightBadge}>
                        <Ionicons name="pricetag-outline" size={12} color={colors.accentHover} />
                        <Text style={styles.highlightText}>{cat.wholesaleHighlight}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
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
    paddingBottom: 32,
  },
  titleBox: {
    padding: 18,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentHover,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  groupSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  groupCount: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  categoryList: {
    gap: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.charcoal,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
    marginBottom: 6,
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  highlightText: {
    fontSize: 11,
    color: colors.accentHover,
    fontWeight: '600',
  },
});
