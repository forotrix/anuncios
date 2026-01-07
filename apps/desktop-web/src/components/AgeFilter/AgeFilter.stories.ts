import type { Meta, StoryObj } from '@storybook/react';
import { AgeFilter } from '.';

const meta: Meta<typeof AgeFilter> = {
  title: 'Components/AgeFilter',
  component: AgeFilter,
};

export default meta;

type Story = StoryObj<typeof AgeFilter>;

export const Default: Story = {
  args: {},
};
