/* eslint-disable react/button-has-type */
import classNames from 'classnames';
import omit from 'rc-util/lib/omit';
import * as React from 'react';
import type { PresetShapeType } from '../_util/shapes';
import { ConfigContext } from '../config-provider';
import DisabledContext from '../config-provider/DisabledContext';
import type { SizeType } from '../config-provider/SizeContext';
import SizeContext, { sizeNameMap } from '../config-provider/SizeContext';
import { useCompactItemContext } from '../space/Compact';
import { cloneElement, isFragment } from '../_util/reactNode';
import warning from '../_util/warning';
import Group, { GroupSizeContext } from './button-group';
import LoadingIcon from './LoadingIcon';
import type {
  PresetBrandColorType,
  PresetStatusColorType,
  PresetPositionColorType,
} from '../_util/colors';

// CSSINJS
import useStyle from './style';
import Squircle from '../squircle';
import type { TooltipProps } from '../tooltip';
// import Tooltip from '../tooltip';

const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
function isString(str: any) {
  return typeof str === 'string';
}

function isUnBorderedButtonType(type: ButtonType | undefined) {
  return type === 'text' || type === 'link';
}

// Insert one space between two chinese characters automatically.
function insertSpace(
  child: React.ReactElement | string | number,
  needInserted: boolean,
  childClassName?: string,
) {
  // Check the child if is undefined or null.
  if (child === null || child === undefined) {
    return;
  }
  const SPACE = needInserted ? ' ' : '';
  // strictNullChecks oops.
  if (
    typeof child !== 'string' &&
    typeof child !== 'number' &&
    isString(child.type) &&
    isTwoCNChar(child.props.children)
  ) {
    return cloneElement(child, {
      children: child.props.children.split('').join(SPACE),
    });
  }
  if (typeof child === 'string') {
    return isTwoCNChar(child) ? (
      <span className={childClassName}>{child.split('').join(SPACE)}</span>
    ) : (
      <span className={childClassName}>{child}</span>
    );
  }
  if (isFragment(child)) {
    return <span className={childClassName}>{child}</span>;
  }
  return child;
}

function spaceChildren(children: React.ReactNode, needInserted: boolean, childClassName?: string) {
  let isPrevChildPure: boolean = false;
  const childList: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    const type = typeof child;
    const isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }

    isPrevChildPure = isCurrentChildPure;
  });

  // Pass to React.Children.map to auto fill key
  return React.Children.map(childList, (child) =>
    insertSpace(child as React.ReactElement | string | number, needInserted, childClassName),
  );
}

export type ButtonSchema = PresetBrandColorType | PresetStatusColorType | PresetPositionColorType;

const ButtonTypes = ['default', 'primary', 'ghost', 'dashed', 'link', 'text'] as const;
export type ButtonType = typeof ButtonTypes[number];

export type ButtonShape = PresetShapeType;

const ButtonHTMLTypes = ['submit', 'button', 'reset'] as const;
export type ButtonHTMLType = typeof ButtonHTMLTypes[number];

export type LegacyButtonType = ButtonType | 'danger';
export function convertLegacyProps(type?: LegacyButtonType): ButtonProps {
  if (type === 'danger') {
    return { danger: true };
  }
  return { type };
}

export interface BaseButtonProps {
  type?: ButtonType;
  icon?: React.ReactNode;
  /**
   * Shape of Button
   *
   * @default default
   */
  shape?: ButtonShape;
  schema?: ButtonSchema;
  size?: SizeType;
  disabled?: boolean;
  loading?: boolean | { delay?: number };
  contentAlign?: 'default' | 'left';
  prefixCls?: string;
  className?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  children?: React.ReactNode;
  title?: string;
  tooltip?: TooltipProps['title'];
  tooltipPlacement?: TooltipProps['placement'];
}

// Typescript will make optional not optional if use Pick with union.
// Should change to `AnchorButtonProps | NativeButtonProps` and `any` to `HTMLAnchorElement | HTMLButtonElement` if it fixed.
// ref: https://github.com/ant-design/ant-design/issues/15930
export type AnchorButtonProps = {
  href: string;
  target?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
} & BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<any>, 'type' | 'onClick'>;

export type NativeButtonProps = {
  htmlType?: ButtonHTMLType;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
} & BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<any>, 'type' | 'onClick'>;

export type ButtonProps = Partial<AnchorButtonProps & NativeButtonProps>;

type CompoundedComponent = React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLElement>
> & {
  Group: typeof Group;
  /** @internal */
  __ANT_BUTTON: boolean;
};

type Loading = number | boolean;

const InternalButton: React.ForwardRefRenderFunction<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
> = (props, ref) => {
  const {
    loading = false,
    prefixCls: customizePrefixCls,
    type = 'default',
    danger,
    shape = 'default',
    size: customizeSize = 'md',
    disabled: customDisabled,
    contentAlign,
    className,
    children,
    icon,
    ghost = false,
    block = false,
    // tooltip,
    // tooltipPlacement = 'top',
    /** If we extract items here, we don't need use omit.js */
    // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
    htmlType = 'button' as ButtonProps['htmlType'],
    ...rest
  } = props;

  let { schema = 'primary' } = props;

  if (danger) {
    schema = 'danger';
  }

  const { getPrefixCls, autoInsertSpaceInButton, direction } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('btn', customizePrefixCls);

  // Style
  const [wrapSSR, hashId] = useStyle(prefixCls);

  const size = React.useContext(SizeContext);
  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;

  const groupSize = React.useContext(GroupSizeContext);
  const [innerLoading, setLoading] = React.useState<Loading>(!!loading);
  const [hasTwoCNChar, setHasTwoCNChar] = React.useState(false);
  const buttonRef = (ref as any) || React.createRef<HTMLAnchorElement | HTMLButtonElement>();
  const isNeedInserted = () =>
    React.Children.count(children) === 1 && !icon && !isUnBorderedButtonType(type);

  const fixTwoCNChar = () => {
    // Fix for HOC usage like <FormatMessage />
    if (!buttonRef || !buttonRef.current || autoInsertSpaceInButton === false) {
      return;
    }
    const buttonText = buttonRef.current.textContent;
    if (isNeedInserted() && isTwoCNChar(buttonText)) {
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      setHasTwoCNChar(false);
    }
  };

  // =============== Update Loading ===============
  const loadingOrDelay: Loading = typeof loading === 'boolean' ? loading : loading?.delay || true;

  React.useEffect(() => {
    let delayTimer: number | null = null;

    if (typeof loadingOrDelay === 'number') {
      delayTimer = window.setTimeout(() => {
        delayTimer = null;
        setLoading(loadingOrDelay);
      }, loadingOrDelay);
    } else {
      setLoading(loadingOrDelay);
    }

    return () => {
      if (delayTimer) {
        // in order to not perform a React state update on an unmounted component
        // and clear timer after 'loadingOrDelay' updated.
        window.clearTimeout(delayTimer);
        delayTimer = null;
      }
    };
  }, [loadingOrDelay]);

  React.useEffect(fixTwoCNChar, [buttonRef]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => {
    const { onClick } = props;
    // https://github.com/ant-design/ant-design/issues/30207
    if (innerLoading || mergedDisabled) {
      e.preventDefault();
      return;
    }
    (onClick as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>)?.(e);
  };

  warning(
    !(typeof icon === 'string' && icon.length > 2),
    'Button',
    `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`,
  );

  warning(
    !(ghost && isUnBorderedButtonType(type)),
    'Button',
    "`link` or `text` button can't be a `ghost` button.",
  );

  const autoInsertSpace = autoInsertSpaceInButton !== false;
  const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

  const sizeFullname = compactSize || groupSize || customizeSize || size;
  const sizeCls = sizeFullname ? sizeNameMap[sizeFullname] || '' : '';

  const iconType = innerLoading ? 'loading' : icon;

  const linkButtonRestProps = omit(rest as AnchorButtonProps & { navigate: any }, ['navigate']);

  const hrefAndDisabled = linkButtonRestProps.href !== undefined && mergedDisabled;

  const isIconOnly = !children && children !== 0 && !!iconType;

  const classes = classNames(
    prefixCls,
    hashId,
    {
      [`${prefixCls}-${type}`]: type,
      [`-icon-only`]: isIconOnly,
      [`${prefixCls}-background-ghost`]: ghost && !isUnBorderedButtonType(type),
      [`${prefixCls}-loading`]: innerLoading,
      [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && autoInsertSpace && !innerLoading,
      [`${prefixCls}-block`]: block,
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`-disabled`]: hrefAndDisabled,
      [`-content-align-${contentAlign}`]: !!contentAlign,
      [`-size-${sizeCls}`]: !!sizeCls,
      [`-shape-${shape}`]: !!shape,
      [`-schema-${schema}`]: !!schema,
    },
    compactItemClassnames,
    className,
  );

  const iconNode =
    icon && !innerLoading ? (
      icon
    ) : (
      <LoadingIcon existIcon={!!icon} prefixCls={prefixCls} loading={!!innerLoading} />
    );

  const kids =
    children || children === 0
      ? spaceChildren(children, isNeedInserted() && autoInsertSpace, `${prefixCls}-content-wrapper`)
      : null;

  if (linkButtonRestProps.href !== undefined) {
    return wrapSSR(
      <a {...linkButtonRestProps} className={classes} onClick={handleClick} ref={buttonRef}>
        {iconNode}
        {kids}
      </a>,
    );
  }

  let buttonNode = (
    // <Tooltip title={tooltip} placement={tooltipPlacement}>
    <button
      {...(rest as NativeButtonProps)}
      type={htmlType}
      className={classes}
      onClick={handleClick}
      disabled={mergedDisabled}
      ref={buttonRef}
    >
      {iconNode}
      {kids}
    </button>
    // </Tooltip>
  );

  if (!!icon && isIconOnly && shape === 'squircle' && type === 'default') {
    buttonNode = (
      <Squircle inline={!block} size={size}>
        {buttonNode}
      </Squircle>
    );
  }

  return wrapSSR(buttonNode);
};

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  InternalButton,
) as CompoundedComponent;

if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button';
}

Button.Group = Group;
Button.__ANT_BUTTON = true;

export default Button;
