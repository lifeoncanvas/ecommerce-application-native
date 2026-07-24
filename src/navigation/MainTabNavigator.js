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
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import BecomeVendorScreen from '../screens/profile/BecomeVendorScreen';
import VendorDashboardScreen from '../screens/profile/VendorDashboardScreen';
import VendorStoreScreen from '../screens/profile/VendorStoreScreen';
import ExchangeRequestScreen from '../screens/profile/ExchangeRequestScreen';
import ExchangeListScreen from '../screens/profile/ExchangeListScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import ReturnScreen from '../screens/profile/ReturnScreen';
import LoyaltyScreen from '../screens/profile/LoyaltyScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/profile/TermsConditionsScreen';
import ContactScreen from '../screens/profile/ContactScreen';
import { useTheme } from '../context/ThemeContext';
import { House, SquaresFour, Heart, ShoppingCart, User } from 'phosphor-react-native';

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
      <ProfileStackNav.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStackNav.Screen name="Settings" component={SettingsScreen} />
      <ProfileStackNav.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <ProfileStackNav.Screen name="BecomeVendor" component={BecomeVendorScreen} />
      <ProfileStackNav.Screen name="VendorDashboard" component={VendorDashboardScreen} />
      <ProfileStackNav.Screen name="VendorStore" component={VendorStoreScreen} />
      <ProfileStackNav.Screen name="ExchangeRequest" component={ExchangeRequestScreen} />
      <ProfileStackNav.Screen name="ExchangeList" component={ExchangeListScreen} />
      <ProfileStackNav.Screen name="Support" component={SupportScreen} />
      <ProfileStackNav.Screen name="Return" component={ReturnScreen} />
      <ProfileStackNav.Screen name="Loyalty" component={LoyaltyScreen} />
      <ProfileStackNav.Screen name="About" component={AboutScreen} />
      <ProfileStackNav.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <ProfileStackNav.Screen name="TermsConditions" component={TermsConditionsScreen} />
      <ProfileStackNav.Screen name="Contact" component={ContactScreen} />
    </ProfileStackNav.Navigator>
  );
}

export default function MainTabNavigator() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { 
          backgroundColor: isDarkMode ? colors.surface : colors.navy, 
          borderTopWidth: isDarkMode ? 1 : 0,
          borderColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = size || 22;
          const weight = focused ? 'fill' : 'regular';
          switch (route.name) {
            case 'Home':
              return <House color={color} size={iconSize} weight={weight} />;
            case 'Categories':
              return <SquaresFour color={color} size={iconSize} weight={weight} />;
            case 'Wishlist':
              return <Heart color={color} size={iconSize} weight={weight} />;
            case 'Cart':
              return <ShoppingCart color={color} size={iconSize} weight={weight} />;
            case 'Profile':
              return <User color={color} size={iconSize} weight={weight} />;
            default:
              return null;
          }
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
