import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from ".";

const meta: Meta<typeof SearchInput> = {
  title: "Components/SearchInput",
  component: SearchInput,

  argTypes: {
    propiedad1: {
      options: ["defoult"],
      control: { type: "select" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    propiedad1: "defoult",
    className: {},
  },
};
