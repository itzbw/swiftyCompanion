import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { BREAKPOINTS } from '../constants/config';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveValues {
  width: number;
  height: number;
  deviceType: DeviceType;
  isPortrait: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const useResponsive = (): ResponsiveValues => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const getDeviceType = (width: number): DeviceType => {
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
  };

  const deviceType = getDeviceType(dimensions.width);
  const isPortrait = dimensions.height > dimensions.width;

  return {
    width: dimensions.width,
    height: dimensions.height,
    deviceType,
    isPortrait,
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  };
};

export const getResponsiveValue = <T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): ((deviceType: DeviceType) => T) => {
  return (deviceType: DeviceType) => {
    switch (deviceType) {
      case 'desktop':
        return desktop ?? tablet ?? mobile;
      case 'tablet':
        return tablet ?? mobile;
      default:
        return mobile;
    }
  };
};
