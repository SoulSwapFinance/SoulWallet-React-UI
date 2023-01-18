import type { CSSInterpolation } from '@ant-design/cssinjs';
import type { FullToken } from '../../../theme/internal';
import { genComponentStyleHook, mergeToken } from '../../../theme/internal';

export interface ComponentToken {}

interface AccountCardToken extends FullToken<'AccountCard'> {}

const genAccountCardStyle = (token: AccountCardToken): CSSInterpolation => {
  const { componentCls } = token;

  return [
    {
      [componentCls]: {
        backgroundColor: token.colorBgSecondary,
        borderRadius: token.borderRadiusLG,
        '&:hover': {
          backgroundColor: token.colorBgInput,
        },

        [`${componentCls}-name`]: {
          fontSize: token.fontSizeLG,
          lineHeight: token.lineHeightLG,
          fontWeight: 600,
          color: token.colorTextLight1,
        },

        [`${componentCls}-address`]: {
          fontSize: token.fontSizeSM,
          lineHeight: token.lineHeightSM,
          fontWeight: 500,
          color: token.colorTextLight4,
        },

        [`${componentCls}-icon`]: {
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },

        [`&.-selected`]: {
          backgroundColor: token.colorBgInput,
        },
      },
    },
  ];
};

// ============================== Export ==============================
export default genComponentStyleHook('AccountCard', (token) => {
  const accountCardToken = mergeToken<AccountCardToken>(token);
  return [genAccountCardStyle(accountCardToken)];
});