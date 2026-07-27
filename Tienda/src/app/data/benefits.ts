import { Truck, RefreshCw, Shield, Package, MessageCircle } from "lucide-react";

export interface Benefit {
  icon: any;
  label: string;
  sub: string;
}

export const BENEFITS: Benefit[] = [
  { icon: Truck, label: "Envíos nacionales", sub: "A todo el país" },
  { icon: RefreshCw, label: "Cambios fáciles", sub: "30 días" },
  { icon: Shield, label: "Pago seguro", sub: "100% protegido" },
  { icon: Package, label: "Garantía", sub: "En todos los productos" },
  { icon: MessageCircle, label: "WhatsApp", sub: "Atención inmediata" },
];
