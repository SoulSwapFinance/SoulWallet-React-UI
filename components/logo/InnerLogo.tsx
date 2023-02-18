import * as React from 'react';
import { useContext } from 'react';
import classNames from 'classnames';
import { ConfigContext } from '../config-provider';
import Image from '../image';
import type { PresetIconShapeType } from '../_util/shapes';
import useStyle from './style';

export interface SWLogoProps {
  shape: PresetIconShapeType;
  size: number;
  token?: string;
  network?: string;
}

const InnerLogo: React.FC<SWLogoProps> = ({ size, shape, token, network }: SWLogoProps) => {
  const { theme, getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('inner-logo');
  const [, hashId] = useStyle(prefixCls);
  const classes = classNames(prefixCls, hashId);
  let src = '';

  if (theme && theme.logoMap) {
    if (token) {
      src = theme.logoMap.symbol[token];
    } else if (network) {
      src = theme.logoMap.network[network];
    }

    return (
      <Image
        width={size}
        height={size}
        src={src || theme.logoMap.default}
        preview={false}
        shape={shape}
      />
    );
  }

  return <div className={classes} />;
};

export default InnerLogo;
