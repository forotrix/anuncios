import type { Meta, StoryObj } from "@storybook/react";
import { BotonElegirChicas } from ".";

const meta: Meta<typeof BotonElegirChicas> = {
  title: "Components/BotonElegirChicas",
  component: BotonElegirChicas,

  argTypes: {
    propiedad1: {
      options: ["chicas"],
      control: { type: "select" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BotonElegirChicas>;

export const Default: Story = {
  args: {
    propiedad1: "chicas",
    className: {},
    frameClassName: {},
    divClassName: {},
    slice: "/img/slice-1.png",
  },
};
