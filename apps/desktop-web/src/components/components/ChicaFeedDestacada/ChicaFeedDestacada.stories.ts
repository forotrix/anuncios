import type { Meta, StoryObj } from "@storybook/react";
import { ChicaFeedDestacada } from ".";

const meta: Meta<typeof ChicaFeedDestacada> = {
  title: "Components/ChicaFeedDestacada",
  component: ChicaFeedDestacada,
};

export default meta;

type Story = StoryObj<typeof ChicaFeedDestacada>;

export const Default: Story = {
  args: {
    rectangle: "/img/valentina-hero.svg",
    starStar: "/img/star-1-3.svg",
  },
};
