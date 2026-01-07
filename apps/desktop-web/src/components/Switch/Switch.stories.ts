import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from ".";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,

  argTypes: {
    property1: {
      options: ["switch-btn-3d"],
      control: { type: "select" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    property1: "switch-btn-3d",
    className: {},
  },
};
