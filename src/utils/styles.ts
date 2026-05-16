import { Platform } from 'react-native';

export const createShadow = (
  offsetX: number,
  offsetY: number,
  blur: number,
  color: string,
  opacity: number,
  elevation: number = 2
) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${color.replace(')', `, ${opacity})`).replace('rgb', 'rgba')}`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation: elevation,
  };
};
