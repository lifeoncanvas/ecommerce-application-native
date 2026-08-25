import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { House, SquaresFour, Heart, ShoppingCart, User } from 'phosphor-react-native';

const Tab = createBottomTabNavigator();
const HomeStackNav = createNativeStackNavigator();
const CategoriesStackNav = createNativeStackNavigator();
const WishlistStackNav = createNativeStackNavigator();
const CartStackNav = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

// Nested stack so Home -> Product Listing -> Product Details keeps its own history
function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackNav.Screen name="ProductListing" component={ProductListingScreen} />
      <HomeStackNav.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <HomeStackNav.Screen name="Search" component={SearchScreen} />
      <HomeStackNav.Screen name="VendorDashboard" component={VendorDashboardScreen} />
      <HomeStackNav.Screen name="VendorStore" component={VendorStoreScreen} />
    </HomeStackNav.Navigator>
  );
}

function CategoriesStack() {
  return (
    <CategoriesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CategoriesStackNav.Screen name="CategoriesMain" component={CategoriesScreen} />
      <CategoriesStackNav.Screen name="ProductListing" component={ProductListingScreen} />
      <CategoriesStackNav.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <CategoriesStackNav.Screen name="Search" component={SearchScreen} />
    </CategoriesStackNav.Navigator>
  );
}

function WishlistStack() {
  return (
    <WishlistStackNav.Navigator screenOptions={{ headerShown: false }}>
      <WishlistStackNav.Screen name="WishlistMain" component={WishlistScreen} />
      <WishlistStackNav.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </WishlistStackNav.Navigator>
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
      <ProfileStackNav.Screen name="ProductDetails" component={ProductDetailsScreen} />
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

// Custom Animated Tab Bar with White Background, 58px Height (-2px), and Smooth Transition
function CustomAnimatedTabBar({ state, descriptors, navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { tabBarTranslateY } = useTabBarVisibility();

  // Hide bottom navigation on Categories, ProductListing, ProductDetails screens
  const currentRoute = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(currentRoute) ?? '';
  if (
    focusedRouteName === 'ProductListing' ||
    focusedRouteName === 'ProductDetails'
  ) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: isDarkMode ? colors.surface : '#FFFFFF',
          borderColor: isDarkMode ? colors.border : '#E2E8F0',
          transform: [{ translateY: tabBarTranslateY }],
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const activeColor = colors.gold;
        const inactiveColor = isDarkMode ? colors.textSecondary : '#64748B';
        const color = isFocused ? activeColor : inactiveColor;
        const weight = isFocused ? 'fill' : 'regular';
        const iconSize = 21;

        let IconComponent = House;
        if (route.name === 'Categories') IconComponent = SquaresFour;
        else if (route.name === 'Wishlist') IconComponent = Heart;
        else if (route.name === 'Cart') IconComponent = ShoppingCart;
        else if (route.name === 'Profile') IconComponent = User;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            <IconComponent color={color} size={iconSize} weight={weight} />
            <Text
              style={[
                styles.tabLabel,
                {
                  color,
                  fontWeight: isFocused ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

export default function MainTabNavigator({ isVendor }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomAnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={isVendor ? 'Profile' : 'Home'}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Categories" component={CategoriesStack} />
      <Tab.Screen name="Wishlist" component={WishlistStack} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        initialParams={isVendor ? { openVendorDashboard: true } : undefined}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 58, // Reduced by 2px (from 60px)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 1000,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
});
