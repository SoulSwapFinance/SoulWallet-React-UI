import React from 'react';
import type { ComponentStory, ComponentMeta } from '@storybook/react';
import ActivityIndicator from '..';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Core/Activity Indicator',
  component: ActivityIndicator,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    size: { control: 'number', defaultValue: 16 },
    existIcon: { control: 'boolean', defaultValue: true },
    loading: { control: 'boolean', defaultValue: true },
    loadingIconColor: { control: 'text', defaultValue: '#FFF' },
  },
} as ComponentMeta<typeof ActivityIndicator>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ActivityIndicator> = (args) => (
  <ActivityIndicator {...args} />
);

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {};
