import type { Meta, StoryObj } from "@storybook/react";
import { BotonChicas } from ".";

const meta: Meta<typeof BotonChicas> = {
  title: "Components/BotonChicas",
  component: BotonChicas,

  argTypes: {
    propiedad1: {
      options: ["predeterminada"],
      control: { type: "select" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BotonChicas>;

export const Default: Story = {
  args: {
    propiedad1: "predeterminada",
    className: {},
    buttonStyleStyleFilledIconNoClassName: {},
    buttonStyleDivClassName: {},
    buttonStyleText: "Chicas",
  },
};
