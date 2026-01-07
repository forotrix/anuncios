import type { Meta, StoryObj } from "@storybook/react";
import { Barcelona } from ".";

const meta: Meta<typeof Barcelona> = {
  title: "Components/Barcelona",
  component: Barcelona,
};

export default meta;

type Story = StoryObj<typeof Barcelona>;

export const Default: Story = {
  args: {
    className: {},
  },
};
