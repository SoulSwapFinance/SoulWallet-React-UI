import { generate } from '@ant-design/colors';
import type { GenerateColorMap, GenerateNeutralColorMap } from '../ColorMap';
import { getAlphaColor, getSolidColor } from './colorAlgorithm';
import { colorDarkBase, colorLightBase } from '../seed';

export const generateColorPalettes: GenerateColorMap = (baseColor: string) => {
  const colors = generate(baseColor);
  return {
    1: colors[0],
    2: colors[1],
    3: colors[2],
    4: colors[3],
    5: colors[4],
    6: colors[5],
    7: colors[6],
    8: colors[4],
    9: colors[5],
    10: colors[6],
    // 8: colors[7],
    // 9: colors[8],
    // 10: colors[9],
  };
};

export const generateNeutralColorPalettes: GenerateNeutralColorMap = (
  bgBaseColor: string,
  textBaseColor: string,
) => {
  const colorBgBase = bgBaseColor || colorDarkBase;
  const colorTextBase = textBaseColor || colorLightBase;

  return {
    colorBgBase,
    colorTextBase,

    colorText: colorTextBase,
    colorTextSecondary: getAlphaColor(colorTextBase, 0.65),
    colorTextTertiary: getAlphaColor(colorTextBase, 0.45),
    colorTextQuaternary: getAlphaColor(colorTextBase, 0.25),

    colorFill: getAlphaColor(colorTextBase, 0.15),
    colorFillSecondary: getAlphaColor(colorTextBase, 0.06),
    colorFillTertiary: getAlphaColor(colorTextBase, 0.04),
    colorFillQuaternary: getAlphaColor(colorTextBase, 0.02),

    colorBgLayout: getSolidColor(colorBgBase, 4),
    colorBgContainer: getSolidColor(colorBgBase, 0),
    colorBgElevated: getSolidColor(colorBgBase, 0),
    colorBgSpotlight: getAlphaColor(colorTextBase, 0.85),

    colorBorder: getSolidColor(colorBgBase, 15),

    // todo: change later
    colorBorderSecondary: getSolidColor(colorBgBase, 15),
    colorBgDefault: getSolidColor(colorBgBase, 6),
    colorBgSecondary: getSolidColor(colorBgBase, 6),
    colorBgInput: getSolidColor(colorBgBase, 6),
    colorBgBorder: getSolidColor(colorBgBase, 6),
    colorBgDivider: getSolidColor(colorBgBase, 6),

    colorTextLight1: colorLightBase,
    colorTextLight2: getAlphaColor(colorLightBase, 0.85),
    colorTextLight3: getAlphaColor(colorLightBase, 0.65),
    colorTextLight4: getAlphaColor(colorLightBase, 0.45),
    colorTextLight5: getAlphaColor(colorLightBase, 0.3),
    colorTextLight6: getAlphaColor(colorLightBase, 0.2),
    colorTextLight7: getAlphaColor(colorLightBase, 0.12),
    colorTextLight8: getAlphaColor(colorLightBase, 0.08),
    colorTextLight9: getAlphaColor(colorLightBase, 0.04),

    colorTextDark1: colorDarkBase,
    colorTextDark2: getAlphaColor(colorDarkBase, 0.85),
    colorTextDark3: getAlphaColor(colorDarkBase, 0.65),
    colorTextDark4: getAlphaColor(colorDarkBase, 0.45),
    colorTextDark5: getAlphaColor(colorDarkBase, 0.25),
    colorTextDark6: getAlphaColor(colorDarkBase, 0.15),
    colorTextDark7: getAlphaColor(colorDarkBase, 0.06),
    colorTextDark8: getAlphaColor(colorDarkBase, 0.04),
    colorTextDark9: getAlphaColor(colorDarkBase, 0.02),
  };
};
