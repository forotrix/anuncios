import type { Meta, StoryObj } from "@storybook/react";
import { CarouselIndicators } from ".";

const meta: Meta<typeof CarouselIndicators> = {
  title: "Components/CarouselIndicators",
  component: CarouselIndicators,

  argTypes: {
    count: {
      control: { type: "number" },
    },
    activeIndex: {
      control: { type: "number", min: 0 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CarouselIndicators>;

export const Default: Story = {
  args: {
    count: 3,
    activeIndex: 0,
  },
};
