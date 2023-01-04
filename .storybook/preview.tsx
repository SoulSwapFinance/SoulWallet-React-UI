import 'antd/dist/reset.css';
import { Story } from '@storybook/react';
import React from 'react';
import { ConfigProvider, theme } from '../components';
import seedToken from '../components/theme/themes/seed';
import { SWPreviewTheme } from './theme';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    theme: SWPreviewTheme,
  },
  backgrounds: {
    default: 'Figma',
    values: [
      {
        name: 'Figma',
        value: '#000000',
      },
      {
        name: 'Extension',
        value: SWPreviewTheme.appContentBg,
      },
    ],
  },
  viewport: {
    viewports: {
      extension: { name: 'Extension', styles: { width: '400px', height: '600px', type: 'other' } },
      mobile: { name: 'Mobile', styles: { width: '400px', height: '856px', type: 'mobile' } },
      ...INITIAL_VIEWPORTS,
    },
    defaultViewport: 'extension',
  },
};

export const decorators = [
  (Component: Story) => (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          ...seedToken,
        },
      }}
    >
      <div>
        <Component />
      </div>
    </ConfigProvider>
  ),
];
