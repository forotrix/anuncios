import Link from "next/link";
import { PageDefinition } from "@/config/routes";

interface Props {
  page: PageDefinition;
}

export const PageHeader = ({ page }: Props) => {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-6 py-6 text-white">
      <p className="text-xs uppercase tracking-[0.3em] text-white/60">
        Mock
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-h1-2-0 text-[length:var(--h1-2-0-font-size)] leading-[var(--h1-2-0-line-height)] text-white">
            {page.title}
          </h1>
          <p className="max-w-3xl text-sm text-white/70">{page.description}</p>
        </div>

        {page.cta && (
          <Link
            href={page.href}
            className="rounded-full bg-gradient-to-r from-rojo-pasion500 via-rojo-pasion300 to-rojo-cereza200 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-shadow-g"
          >
            {page.cta}
          </Link>
        )}
      </div>
    </section>
  );
};
