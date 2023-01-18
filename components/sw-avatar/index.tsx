import * as React from 'react';
import Identicon from '@polkadot/react-identicon';
import type { IconTheme } from '@polkadot/react-identicon/types';
import classNames from 'classnames';
import Avatar from 'boring-avatars';
import useStyle from './style';
import { ConfigContext } from '../config-provider';
import Image from '../image';

export interface SwAvatarProps {
  theme?: IconTheme;
  size?: number;
  value: string | null;
  identPrefix: number;
  isShowSubIcon?: boolean;
  subIcon?: React.ReactNode;
  isAllAccount?: boolean;
  allAccountImg?: string;
  allAccountName?: string;
  allAccountVariant?: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';
  allAccountColors?: string[];
}

const SwAvatar = ({
  size = 40,
  value,
  identPrefix,
  theme = 'polkadot',
  isShowSubIcon,
  subIcon,
  isAllAccount,
  allAccountImg,
  allAccountName,
  allAccountVariant = 'marble',
  allAccountColors = ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
}: SwAvatarProps) => {
  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('sw-avatar');
  const [wrapSSR, hashId] = useStyle(prefixCls);
  const classes = classNames(prefixCls, hashId);
  return wrapSSR(
    <div
      className={classes}
      style={{ padding: size * 0.1, borderWidth: size * 0.05, width: size, height: size }}
    >
      {/* eslint-disable-next-line no-nested-ternary */}
      {isAllAccount ? (
        allAccountImg ? (
          <Image
            src={allAccountImg}
            width={size * 0.7}
            height={size * 0.7}
            shape="circle"
            preview={false}
          />
        ) : (
          <Avatar
            size={size * 0.7}
            name={allAccountName || ''}
            variant={allAccountVariant}
            colors={allAccountColors}
          />
        )
      ) : (
        <Identicon
          className="icon"
          size={size * 0.7}
          value={value}
          prefix={identPrefix}
          theme={theme}
        />
      )}
      {!isAllAccount && isShowSubIcon && <div className="sub-icon">{subIcon}</div>}
    </div>,
  );
};

export default SwAvatar;