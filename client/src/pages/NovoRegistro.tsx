/**
 * Página: Novo Registro de Ocorrência
 * Design: Governo Digital Brasileiro — formulário estruturado em seções
 * Paleta: Azul institucional, campos com foco visível
 */

import { useState } from "react";
import { useLocation } from "wouter";
import {
  User,
  School,
  AlertTriangle,
  FileText,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const escolas = [
  "E.M. Padre Wilson",
  "E.M. José Calil Ahouagi",
  "E.M. Olavo Costa",
  "E.M. Cândido Mota",
  "E.M. Henrique Hallfeld",
  "E.M. Delfim Moreira",
  "E.M. Presidente Itamar Franco",
  "E.M. Assis Chateaubriand",
  "E.M. Coronel Pacheco",
  "E.M. Francisco Bernardino",
  "E.M. Getúlio Vargas",
  "E.M. Santos Dumont",
];

const anos = [
  "1º Período",
  "2º Período",
  "1º Ano",
  "2º Ano",
  "3º Ano",
  "4º Ano",
  "5º Ano",
  "6º Ano",
  "7º Ano",
  "8º Ano",
  "9º Ano",
];

const tiposFalta = [
  "Faltas alternadas",
  "Faltas consecutivas",
  "Faltas injustificadas",
  "Abandono escolar",
];

interface FormData {
  nomeAluno: string;
  cpfAluno: string;
  dataNascimento: string;
  escola: string;
  ano: string;
  turma: string;
  quantidadeFaltas: string;
  tipoFalta: string;
  periodoInicio: string;
  periodoFim: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  enderecoResponsavel: string;
  observacoes: string;
  status: string;
}

const initialForm: FormData = {
  nomeAluno: "",
  cpfAluno: "",
  dataNascimento: "",
  escola: "",
  ano: "",
  turma: "",
  quantidadeFaltas: "",
  tipoFalta: "",
  periodoInicio: "",
  periodoFim: "",
  nomeResponsavel: "",
  telefoneResponsavel: "",
  enderecoResponsavel: "",
  observacoes: "",
  status: "pendente",
};

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground";

const selectClass =
  "w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer";

export default function NovoRegistro() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [, navigate] = useLocation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!form.nomeAluno || !form.escola || !form.ano || !form.quantidadeFaltas || !form.tipoFalta) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitted(true);
    toast.success("Ocorrência registrada com sucesso!");
  };

  const handleNovo = () => {
    setForm(initialForm);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-card-enter">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Ocorrência Registrada!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            A ocorrência de infrequência de <strong>{form.nomeAluno}</strong> foi registrada com sucesso
            e está aguardando ação.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleNovo}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all active:scale-[0.97]"
              style={{ background: "oklch(0.45 0.18 264)" }}
            >
              Registrar Nova Ocorrência
            </button>
            <a href="/ocorrencias">
              <button className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-foreground border border-border hover:bg-accent transition-colors">
                Ver Todas as Ocorrências
              </button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Novo Registro</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Preencha os dados para registrar uma nova ocorrência de infrequência
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section: Dados do Aluno */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-card-enter">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-accent/20">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <User size={14} className="text-blue-500" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Dados do Aluno</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Nome completo do aluno" required>
                <input
                  type="text"
                  name="nomeAluno"
                  value={form.nomeAluno}
                  onChange={handleChange}
                  placeholder="Ex: Lucas Gabriel Santos"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="CPF do aluno" hint="Opcional — se disponível">
              <input
                type="text"
                name="cpfAluno"
                value={form.cpfAluno}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className={inputClass}
              />
            </Field>
            <Field label="Data de nascimento">
              <input
                type="date"
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        {/* Section: Dados Escolares */}
        <div
          className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-card-enter"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-accent/20">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <School size={14} className="text-purple-500" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Dados Escolares</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Escola" required>
                <select
                  name="escola"
                  value={form.escola}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Selecione a escola</option>
                  {escolas.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Ano / Série" required>
              <select
                name="ano"
                value={form.ano}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Selecione o ano</option>
                {anos.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Turma">
              <input
                type="text"
                name="turma"
                value={form.turma}
                onChange={handleChange}
                placeholder="Ex: A, B, C..."
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        {/* Section: Dados da Infrequência */}
        <div
          className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-card-enter"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-accent/20">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber-500" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Dados da Infrequência</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Quantidade de faltas" required>
              <input
                type="number"
                name="quantidadeFaltas"
                value={form.quantidadeFaltas}
                onChange={handleChange}
                placeholder="Ex: 10"
                min="1"
                className={inputClass}
              />
            </Field>
            <Field label="Tipo de falta" required>
              <select
                name="tipoFalta"
                value={form.tipoFalta}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Selecione o tipo</option>
                {tiposFalta.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Período — início">
              <input
                type="date"
                name="periodoInicio"
                value={form.periodoInicio}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
            <Field label="Período — fim">
              <input
                type="date"
                name="periodoFim"
                value={form.periodoFim}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
            <Field label="Status inicial" required>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="pendente">Pendente</option>
                <option value="notificado">Notificado ao CT</option>
                <option value="busca_ativa">Busca Ativa</option>
                <option value="violacao">Violação de Direitos</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Section: Dados do Responsável */}
        <div
          className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-card-enter"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-accent/20">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <User size={14} className="text-emerald-500" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Dados do Responsável</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome do responsável">
              <input
                type="text"
                name="nomeResponsavel"
                value={form.nomeResponsavel}
                onChange={handleChange}
                placeholder="Ex: Maria da Silva"
                className={inputClass}
              />
            </Field>
            <Field label="Telefone">
              <input
                type="tel"
                name="telefoneResponsavel"
                value={form.telefoneResponsavel}
                onChange={handleChange}
                placeholder="(32) 99999-0000"
                className={inputClass}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Endereço">
                <input
                  type="text"
                  name="enderecoResponsavel"
                  value={form.enderecoResponsavel}
                  onChange={handleChange}
                  placeholder="Rua, número, bairro — Juiz de Fora/MG"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Section: Observações */}
        <div
          className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-card-enter"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-accent/20">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText size={14} className="text-slate-500" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Observações</h2>
          </div>
          <div className="p-5">
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              placeholder="Descreva informações adicionais relevantes para o caso..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Submit */}
        <div
          className="flex justify-end gap-3 animate-card-enter"
          style={{ animationDelay: "300ms" }}
        >
          <a href="/">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
          </a>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-150 active:scale-[0.97] shadow-sm hover:shadow-md"
            style={{ background: "oklch(0.45 0.18 264)" }}
          >
            Registrar Ocorrência
            <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
