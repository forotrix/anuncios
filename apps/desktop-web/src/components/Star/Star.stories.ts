import type { Meta, StoryObj } from "@storybook/react";
import { Star } from ".";

const meta: Meta<typeof Star> = {
  title: "Components/Star",
  component: Star,

  argTypes: {
    propiedad1: {
      options: ["predeterminada"],
      control: { type: "select" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Star>;

export const Default: Story = {
  args: {
    propiedad1: "predeterminada",
    className: {},
    starClassName: {},
    star: "/img/star-1-1.svg",
  },
};
