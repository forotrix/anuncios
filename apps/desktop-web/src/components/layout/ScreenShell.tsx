import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  disableMinWidth?: boolean;
  disableOverflow?: boolean;
}

export const ScreenShell = ({ children, disableMinWidth = false, disableOverflow = false }: Props) => {
  return (
    <section className={`w-full ${disableOverflow ? "overflow-x-hidden" : "overflow-x-auto"} px-4 pb-16`}>
      <div className={`mx-auto ${disableMinWidth ? "w-full" : "min-w-[1440px]"}`}>{children}</div>
    </section>
  );
};
