/**
 * Página: Painel de Infrequência
 * Design: Governo Digital Brasileiro — cards de métricas, gráfico de rosca SVG, lista de pendentes
 * Paleta: Azul institucional, status semânticos (âmbar, azul, roxo, verde, vermelho)
 */

import {
  AlertTriangle,
  Bell,
  Search,
  CheckCircle,
  ShieldAlert,
  FilePlus,
  ArrowRight,
} from "lucide-react";
import { distribuicaoStatus, metricas, ocorrenciasPendentes } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  sublabel: string;
  icon: React.ReactNode;
  iconBg: string;
  delay?: number;
}

function MetricCard({ label, value, sublabel, icon, iconBg, delay = 0 }: MetricCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm animate-card-enter hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>
          {icon}
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}

// Custom SVG Donut Chart
function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = 100;
  const cy = 100;
  const r = 75;
  const innerR = 45;
  const gap = 2; // degrees gap between segments

  let currentAngle = -90; // start at top

  const segments = data.map((d) => {
    const pct = d.value / total;
    const angleDeg = pct * 360 - gap;
    const startAngle = currentAngle + gap / 2;
    const endAngle = startAngle + angleDeg;
    currentAngle += pct * 360;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const ix1 = cx + innerR * Math.cos(toRad(startAngle));
    const iy1 = cy + innerR * Math.sin(toRad(startAngle));
    const ix2 = cx + innerR * Math.cos(toRad(endAngle));
    const iy2 = cy + innerR * Math.sin(toRad(endAngle));
    const largeArc = angleDeg > 180 ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ");

    return { ...d, path, pct };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.path}
            fill={seg.color}
            className="transition-opacity duration-200 hover:opacity-80"
          />
        ))}
        {/* Center text */}
        <text x="100" y="96" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1f2937">
          {total}
        </text>
        <text x="100" y="112" textAnchor="middle" fontSize="10" fill="#6b7280">
          ocorrências
        </text>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Painel() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Painel de Infrequência</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Acompanhe as ocorrências da sua escola</p>
        </div>
        <a href="/novo-registro">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-150 active:scale-[0.97] shadow-sm hover:shadow-md"
            style={{ background: "oklch(0.45 0.18 264)" }}
          >
            <FilePlus size={16} />
            Registrar Ocorrência
          </button>
        </a>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Pendentes"
          value={metricas.pendentes}
          sublabel="Aguardando ação"
          icon={<AlertTriangle size={18} className="text-amber-500" />}
          iconBg="bg-amber-50"
          delay={0}
        />
        <MetricCard
          label="Notificados"
          value={metricas.notificados}
          sublabel="Enviado ao CT"
          icon={<Bell size={18} className="text-blue-500" />}
          iconBg="bg-blue-50"
          delay={60}
        />
        <MetricCard
          label="Busca Ativa"
          value={metricas.buscaAtiva}
          sublabel="Em andamento"
          icon={<Search size={18} className="text-purple-500" />}
          iconBg="bg-purple-50"
          delay={120}
        />
        <MetricCard
          label="Resolvidos"
          value={metricas.resolvidos}
          sublabel="Concluídos"
          icon={<CheckCircle size={18} className="text-emerald-500" />}
          iconBg="bg-emerald-50"
          delay={180}
        />
        <MetricCard
          label="Violações"
          value={metricas.violacoes}
          sublabel="Direitos violados"
          icon={<ShieldAlert size={18} className="text-red-500" />}
          iconBg="bg-red-50"
          delay={240}
        />
      </div>

      {/* Bottom Section: Chart + Pending List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Donut Chart */}
        <div
          className="lg:col-span-2 bg-white rounded-xl border border-border p-5 shadow-sm animate-card-enter"
          style={{ animationDelay: "300ms" }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">Distribuição por Status</h2>
          <DonutChart data={distribuicaoStatus} />
        </div>

        {/* Pending Occurrences List */}
        <div
          className="lg:col-span-3 bg-white rounded-xl border border-border shadow-sm animate-card-enter"
          style={{ animationDelay: "360ms" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Ocorrências Pendentes</h2>
            <a href="/ocorrencias">
              <button className="flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors">
                Ver todas
                <ArrowRight size={13} />
              </button>
            </a>
          </div>
          <div className="divide-y divide-border">
            {ocorrenciasPendentes.slice(0, 5).map((oc, idx) => (
              <div
                key={oc.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/40 transition-colors duration-150 animate-card-enter"
                style={{ animationDelay: `${400 + idx * 50}ms` }}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{oc.aluno}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {oc.ano} · {oc.escola} · {oc.faltas}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {oc.status === "violacao" && (
                    <ShieldAlert size={14} className="text-red-500" />
                  )}
                  <StatusBadge status={oc.status} showIcon={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
