import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';

import HomeScreen from '../screens/home/HomeScreen';
import ProductListingScreen from '../screens/product/ProductListingScreen';
import ProductDetailsScreen from '../screens/product/ProductDetailsScreen';
import SearchScreen from '../screens/search/SearchScreen';
import CategoriesScreen from '../screens/category/CategoriesScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import PaymentScreen from '../screens/cart/PaymentScreen';
import OrderSuccessScreen from '../screens/cart/OrderSuccessScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyOrdersScreen from '../screens/profile/MyOrdersScreen';
import OrderDetailsScreen from '../screens/profile/OrderDetailsScreen';
import TrackOrderScreen from '../screens/profile/TrackOrderScreen';

const Tab = createBottomTabNavigator();
const HomeStackNav = createNativeStackNavigator();
const CartStackNav = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

// Nested stack so Home -> Product Listing -> Product Details keeps its own history
// while still living inside the "Home" tab.
function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackNav.Screen name="ProductListing" component={ProductListingScreen} />
      <HomeStackNav.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <HomeStackNav.Screen name="Search" component={SearchScreen} />
    </HomeStackNav.Navigator>
  );
}

// Nested stack so Cart -> Checkout keeps its own history
function CartStack() {
  return (
    <CartStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CartStackNav.Screen name="CartMain" component={CartScreen} />
      <CartStackNav.Screen name="Checkout" component={CheckoutScreen} />
      <CartStackNav.Screen name="Payment" component={PaymentScreen} />
      <CartStackNav.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    </CartStackNav.Navigator>
  );
}

// Nested stack so Profile -> My Orders -> Order Details -> Tracking keeps history
function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStackNav.Screen name="MyOrders" component={MyOrdersScreen} />
      <ProfileStackNav.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <ProfileStackNav.Screen name="TrackOrder" component={TrackOrderScreen} />
    </ProfileStackNav.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.navy, borderTopWidth: 0 },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
