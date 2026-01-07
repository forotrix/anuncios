import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const ScreenShell = ({ children }: Props) => {
  return (
    <section className="w-full overflow-x-auto px-4 pb-16">
      <div className="mx-auto min-w-[1440px]">{children}</div>
    </section>
  );
};
