import type { Meta, StoryObj } from "@storybook/react";
import { ButtonStyle } from ".";

const meta: Meta<typeof ButtonStyle> = {
  title: "Components/ButtonStyle",
  component: ButtonStyle,

  argTypes: {
    style: {
      options: ["filled"],
      control: { type: "select" },
    },
    icon: {
      options: ["no-icon"],
      control: { type: "select" },
    },
    state: {
      options: ["hover"],
      control: { type: "select" },
    },
    size: {
      options: ["large"],
      control: { type: "select" },
    },
    borderRadius: {
      options: ["thirty-two"],
      control: { type: "select" },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ButtonStyle>;

export const Default: Story = {
  args: {
    style: "filled",
    icon: "no-icon",
    state: "hover",
    size: "large",
    borderRadius: "thirty-two",
    className: {},
    divClassName: {},
    text: "Button",
  },
};
