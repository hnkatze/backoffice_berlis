import {
  EggFried,
  Coffee,
  Cake,
  IceCream,
  Drumstick,
  GlassWater,
} from "lucide-react";
import { BurgerIcon, TacoIcon } from "./Icons";

export const categoryIcons: { [key: string]: JSX.Element } = {
  Desayunos: <EggFried className="w-6 h-6" strokeWidth={1.5} />,
  Cafés: <Coffee className="w-6 h-6" strokeWidth={1.5} />,
  "Postres y Panecillos": <Cake className="w-6 h-6" strokeWidth={1.5} />,
  "Ice Coffee Menu": <IceCream className="w-6 h-6" strokeWidth={1.5} />,
  "Alitas y Chicken Fingers": (
    <Drumstick className="w-6 h-6" strokeWidth={1.5} />
  ),
  Hamburguesas: <BurgerIcon className="w-6 h-6" />,
  "Tacos y Otros": <TacoIcon className="w-6 h-6" />,
  Bebidas: <GlassWater className="w-6 h-6" strokeWidth={1.5} />,
};

