import * as React from 'react';
import type { IconTheme } from '@polkadot/react-identicon/types';
import classNames from 'classnames';
import { CheckCircle } from 'phosphor-react';
import { ConfigContext } from '../../config-provider';
import { toShort } from '../../_util/address';
import SwAvatar from '../../sw-avatar';
import useStyle from './style';
import Web3Block from '..';
import Icon from '../../icon';

export interface AccountCardProps {
  address: string;
  size: number;
  accountName: string;
  theme: IconTheme;
  prefix: number;
  isShowSubIcon: boolean;
  preLength?: number;
  subLength?: number;
  rightComponent?: React.ReactNode;
  subIcon?: React.ReactNode;
  isSelected?: boolean;
  onPressItem?: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  address,
  size,
  theme,
  prefix,
  isShowSubIcon,
  accountName,
  preLength,
  subLength,
  rightComponent,
  subIcon,
  isSelected,
  onPressItem,
}) => {
  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('account-card');
  const [wrapSSR, hashId] = useStyle(prefixCls);
  const classes = classNames(prefixCls, hashId, {
    '-selected': isSelected,
  });

  const getLeftItem = () => (
    <SwAvatar
      value={address}
      size={size}
      theme={theme}
      prefix={prefix}
      isShowSubIcon={isShowSubIcon}
      subIcon={subIcon}
    />
  );

  const getBodyItem = () => (
    <>
      <div className={`${prefixCls}-name`}>{accountName}</div>
      <div className={`${prefixCls}-address`}>{toShort(address || '', preLength, subLength)}</div>
    </>
  );

  const getRightItem = () => (
    <>
      {isSelected && (
        <div className={`${prefixCls}-icon`}>
          <Icon
            type="phosphor"
            phosphorIcon={CheckCircle}
            size="sm"
            iconColor="#4CEAAC"
            weight="fill"
          />
        </div>
      )}
      {rightComponent}
    </>
  );

  return wrapSSR(
    <Web3Block
      className={classes}
      leftItem={getLeftItem()}
      bodyItem={getBodyItem()}
      rightItem={getRightItem()}
      onClick={onPressItem}
    />,
  );
};

export default AccountCard;
