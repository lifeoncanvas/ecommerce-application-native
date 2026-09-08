import React, { createContext, useContext, useRef } from 'react';
import { Animated, Platform, Easing } from 'react-native';

const TabBarVisibilityContext = createContext();

export function TabBarVisibilityProvider({ children }) {
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const isTabBarHidden = useRef(false);
  const lastScrollY = useRef(0);

  const hideTabBar = () => {
    if (!isTabBarHidden.current) {
      isTabBarHidden.current = true;
      tabBarTranslateY.stopAnimation();
      Animated.timing(tabBarTranslateY, {
        toValue: 70, // Smoothly slide down off the bottom of the screen
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  };

  const showTabBar = () => {
    if (isTabBarHidden.current) {
      isTabBarHidden.current = false;
      tabBarTranslateY.stopAnimation();
      Animated.timing(tabBarTranslateY, {
        toValue: 0, // Smoothly slide back up into view
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  };

  const handleScrollForTabBar = (event) => {
    if (!event || !event.nativeEvent || !event.nativeEvent.contentOffset) return;

    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    // When near the top, always bring the navbar up
    if (currentY <= 10) {
      showTabBar();
      lastScrollY.current = Math.max(0, currentY);
      return;
    }

    // Scroll Down (finger swipes up, content moves up) -> Transition navbar down (hide)
    if (diff > 5) {
      hideTabBar();
    }
    // Scroll Up (finger swipes down, content moves down) -> Transition navbar up (unhide)
    else if (diff < -5) {
      showTabBar();
    }

    lastScrollY.current = Math.max(0, currentY);
  };

  return (
    <TabBarVisibilityContext.Provider
      value={{
        tabBarTranslateY,
        hideTabBar,
        showTabBar,
        handleScrollForTabBar,
      }}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    return {
      tabBarTranslateY: new Animated.Value(0),
      hideTabBar: () => {},
      showTabBar: () => {},
      handleScrollForTabBar: () => {},
    };
  }
  return context;
}
