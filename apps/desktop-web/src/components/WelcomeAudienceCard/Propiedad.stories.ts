import type { Meta, StoryObj } from "@storybook/react";
import { Propiedad } from ".";

const meta: Meta<typeof Propiedad> = {
  title: "Components/Propiedad",
  component: Propiedad,
};

export default meta;

type Story = StoryObj<typeof Propiedad>;

export const Default: Story = {
  args: {
    className: {},
  },
};
