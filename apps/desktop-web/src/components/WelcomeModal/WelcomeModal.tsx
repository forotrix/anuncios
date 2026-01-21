import Link from "next/link";

type Props = {
  onClose?: () => void;
};

export const WelcomeModal = ({ onClose }: Props) => {
  const handleChoice = () => {
    onClose?.();
  };

  return (
    <div className="relative w-[520px] max-w-[90vw] rounded-[18px] bg-[#0d1619] px-8 py-7 text-white shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-rojo-pasion200">Bienvenido a ForoTrix</h3>
        <p className="text-base leading-relaxed text-white/90">
          Un mundo de placer y compania exclusiva, reservado solo para{" "}
          <span className="font-semibold">mayores de 18 años</span>.
        </p>
      </div>

      <div className="mt-6 text-center text-lg font-semibold text-rojo-pasion200">
        Con quien deseas disfrutar hoy?
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link
          href="/feed?sex=female&identity=cis"
          onClick={handleChoice}
          className="flex justify-center rounded-full bg-rojo-pasion400 px-6 py-3 text-base font-semibold text-white transition hover:bg-rojo-pasion500"
        >
          Chicas
        </Link>
        <Link
          href="/feed?sex=female&identity=trans"
          onClick={handleChoice}
          className="flex justify-center rounded-full bg-rojo-pasion400 px-6 py-3 text-base font-semibold text-white transition hover:bg-rojo-pasion500"
        >
          Chicas trans
        </Link>
        <Link
          href="/feed?sex=male&identity=cis"
          onClick={handleChoice}
          className="flex justify-center rounded-full bg-rojo-pasion400 px-6 py-3 text-base font-semibold text-white transition hover:bg-rojo-pasion500"
        >
          Chicos
        </Link>
        <Link
          href="/feed?sex=male&identity=trans"
          onClick={handleChoice}
          className="flex justify-center rounded-full bg-rojo-pasion400 px-6 py-3 text-base font-semibold text-white transition hover:bg-rojo-pasion500"
        >
          Chicos trans
        </Link>
      </div>
    </div>
  );
};
