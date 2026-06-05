/**
 * Componente de badge de status para ocorrências
 * Cores semânticas: Pendente (âmbar), Notificado (azul), Busca Ativa (roxo), Resolvido (verde), Violação (vermelho)
 */

import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = "pendente" | "notificado" | "busca_ativa" | "resolvido" | "violacao";

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string; showShield?: boolean }> = {
  pendente: {
    label: "Pendente",
    className: "badge-pending",
    showShield: false,
  },
  notificado: {
    label: "Notificado ao CT",
    className: "badge-notified",
  },
  busca_ativa: {
    label: "Busca Ativa",
    className: "badge-active-search",
  },
  resolvido: {
    label: "Resolvido",
    className: "badge-resolved",
  },
  violacao: {
    label: "Violação",
    className: "badge-violation",
    showShield: true,
  },
};

export default function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {showIcon && config.showShield && <ShieldAlert size={11} />}
      {config.label}
    </span>
  );
}
