import * as React from 'react';

export type SizeType = 'xs' | 'sm' | 'md' | 'lg' | 'small' | 'middle' | 'large' | undefined;

export const sizeNameMap = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  large: 'lg',
  small: 'sm',
  middle: 'md',
};

const SizeContext = React.createContext<SizeType>(undefined);

export interface SizeContextProps {
  size?: SizeType;
  children?: React.ReactNode;
}

export const SizeContextProvider: React.FC<SizeContextProps> = ({ children, size }) => {
  const originSize = React.useContext<SizeType>(SizeContext);
  return <SizeContext.Provider value={size || originSize}>{children}</SizeContext.Provider>;
};

export default SizeContext;
