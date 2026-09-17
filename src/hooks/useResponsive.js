import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const windowDims = useWindowDimensions();
  const width = windowDims?.width || 375;
  const height = windowDims?.height || 812;

  const isSmallPhone = width < 360;
  const isStandardPhone = width >= 360 && width < 414;
  const isLargePhone = width >= 414 && width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isLargeTablet = width >= 1024;
  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  // Responsive horizontal padding
  let horizontalPadding = 16;
  if (isSmallPhone) {
    horizontalPadding = 12;
  } else if (isTablet) {
    horizontalPadding = 20;
  } else if (isLargeTablet) {
    horizontalPadding = 24;
  }

  // Content max width for desktop / tablet centering
  const contentMaxWidth = isLargeTablet ? 1200 : isTablet ? 960 : width;
  const containerWidth = Math.min(width, contentMaxWidth);

  // Responsive columns for product feed:
  // 2 columns for phones and portrait views (< 640px)
  // 3 columns for tablets / landscape (640px - 1099px)
  // 4 columns for desktop / large screens (>= 1100px)
  let gridColumns = 2;
  if (width >= 1100) {
    gridColumns = 4;
  } else if (width >= 640) {
    gridColumns = 3;
  } else {
    gridColumns = 2;
  }

  // Consistent gap between product cards
  const productGridGap = isSmallPhone ? 10 : 14;

  // Dynamic card width: precisely distributes cards so there is never an awkward empty gap
  const availableGridWidth = containerWidth - (horizontalPadding * 2);
  const cardWidth = Math.max(140, Math.floor((availableGridWidth - (productGridGap * (gridColumns - 1))) / gridColumns));

  // Top Brands Section: always 4 items per row, 2 rows (even count top and bottom)
  const brandCols = 4;
  let brandGridGap = 12;
  if (width >= 1024) {
    brandGridGap = 24;
  } else if (width >= 640) {
    brandGridGap = 18;
  } else if (width >= 400) {
    brandGridGap = 14;
  } else {
    brandGridGap = 10;
  }

  // Dynamic brand tile width following the container width
  const brandTileWidth = Math.floor((availableGridWidth - (brandGridGap * (brandCols - 1))) / brandCols);

  // Dynamically scaled brand image size within tile
  let brandImageSize = 64;
  if (width >= 1024) {
    brandImageSize = 92;
  } else if (width >= 640) {
    brandImageSize = 84;
  } else if (width >= 400) {
    brandImageSize = Math.min(80, Math.round(brandTileWidth * 0.82));
  } else {
    brandImageSize = Math.min(64, Math.round(brandTileWidth * 0.86));
  }

  const brandFontSize = brandTileWidth >= 95 ? 11 : 10;
  const brandRowGap = isSmallPhone ? 12 : 16;

  return {
    width,
    height,
    isSmallPhone,
    isStandardPhone,
    isLargePhone,
    isTablet,
    isLargeTablet,
    isDesktop,
    isMobile,
    gridColumns,
    horizontalPadding,
    contentMaxWidth,
    containerWidth,
    productGridGap,
    cardWidth,
    brandTileWidth,
    brandImageSize,
    brandGridGap,
    brandFontSize,
    brandRowGap,
  };
}

export default useResponsive;
