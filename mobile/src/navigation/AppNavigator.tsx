import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderSuccessScreen } from '../screens/OrderSuccessScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="OrdersTab" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
