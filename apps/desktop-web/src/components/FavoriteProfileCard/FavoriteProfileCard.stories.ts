import type { Meta, StoryObj } from "@storybook/react";
import { FavoriteProfileCard } from ".";

const meta: Meta<typeof FavoriteProfileCard> = {
  title: "Components/FavoriteProfileCard",
  component: FavoriteProfileCard,
};

export default meta;

type Story = StoryObj<typeof FavoriteProfileCard>;

export const Default: Story = {
  args: {
    className: {},
    star: "/img/star-1-2.svg",
    rectangleClassName: {},
  },
};
