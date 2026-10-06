import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { useCart } from '../context/CartContext';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { WholesaleEnquiryScreen } from '../screens/WholesaleEnquiryScreen';
import { CartScreen } from '../screens/CartScreen';
import { AccountScreen } from '../screens/AccountScreen';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const { totalPieces } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={21} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={21} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ProductsTab"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'layers' : 'layers-outline'} size={21} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="EnquiryTab"
        component={WholesaleEnquiryScreen}
        options={{
          tabBarLabel: 'Enquiry',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge: totalPieces > 0 ? totalPieces : undefined,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bag-handle' : 'bag-handle-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={21} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badge: {
    backgroundColor: colors.accent,
    color: colors.charcoal,
    fontSize: 10,
    fontWeight: '800',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
});
