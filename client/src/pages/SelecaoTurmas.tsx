import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Loader2, Lock, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";

// Estrutura de séries: EF (1º ao 9º) + EM (1º ao 3º)
const SERIES = [
  { id: "ef1-5", label: "1º ao 5º Ano (Fund.)", years: ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"] },
  { id: "ef6-9", label: "6º ao 9º Ano (Fund.)", years: ["6º Ano", "7º Ano", "8º Ano", "9º Ano"] },
  { id: "em", label: "Ensino Médio", years: ["1º Médio", "2º Médio", "3º Médio"] },
];
const CLASSES = ["A", "B", "C", "D"];

export default function SelecaoTurmas() {
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  // Quantas turmas (A, B, C...) cada série tem — padrão 4
  const [classCountPerYear, setClassCountPerYear] = useState<Record<string, number>>({});
  const [, setLocation] = useLocation();

  const schoolId = parseInt(sessionStorage.getItem("schoolId") || "0");
  const coordinatorId = parseInt(sessionStorage.getItem("coordinatorId") || "0");

  const usedClassrooms: string[] = (() => {
    try { return JSON.parse(sessionStorage.getItem("usedClassrooms") || "[]"); } catch { return []; }
  })();
  const usedSet = new Set(usedClassrooms);

  const createClassroomMutation = trpc.classroom.create.useMutation();
  const updateCoordinatorMutation = trpc.coordinator.update.useMutation();

  useEffect(() => {
    if (!schoolId || !coordinatorId) setLocation("/");
    // Expandir primeira seção por padrão
    setExpandedSections({ "ef1-5": true });
  }, [schoolId, coordinatorId, setLocation]);

  const getClassCount = (yearId: string) => classCountPerYear[yearId] ?? 4;

  const getAvailableClassrooms = (year: string, count: number) =>
    CLASSES.slice(0, count)
      .map((c) => `${year} ${c}`)
      .filter((n) => !usedSet.has(n));

  const isUnavailable = (name: string) => usedSet.has(name);

  const toggleClassroom = (name: string) => {
    if (isUnavailable(name)) return;
    setSelectedClassrooms((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleSection = (sectionId: string, years: string[]) => {
    const allAvailable = years.flatMap((y) => getAvailableClassrooms(y, getClassCount(y)));
    const allSelected = allAvailable.every((n) => selectedClassrooms.includes(n));
    if (allSelected) {
      setSelectedClassrooms((prev) => prev.filter((p) => !allAvailable.includes(p)));
    } else {
      setSelectedClassrooms((prev) => [...new Set([...prev, ...allAvailable])]);
    }
  };

  const handleSave = async () => {
    setError("");
    if (selectedClassrooms.length === 0) { setError("Selecione pelo menos uma turma"); return; }
    setIsLoading(true);
    try {
      for (const name of selectedClassrooms) {
        await createClassroomMutation.mutateAsync({ schoolId, name });
      }
      await updateCoordinatorMutation.mutateAsync({
        id: coordinatorId,
        selectedClassrooms: JSON.stringify(selectedClassrooms),
      });
      sessionStorage.setItem("selectedClassrooms", JSON.stringify(selectedClassrooms));
      setLocation("/dashboard-escola");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar turmas");
      setIsLoading(false);
    }
  };

  const schoolName = sessionStorage.getItem("schoolName") || "";

  const totalAvailable = SERIES.flatMap((s) =>
    s.years.flatMap((y) => getAvailableClassrooms(y, getClassCount(y)))
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                IF
              </div>
            </div>
            <CardTitle className="text-2xl">Configurar Turmas</CardTitle>
            <CardDescription className="font-medium text-gray-700">{schoolName}</CardDescription>
            {usedClassrooms.length > 0 && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <Lock className="w-3 h-3 flex-shrink-0" />
                <span>
                  <strong>{usedClassrooms.length}</strong> turma{usedClassrooms.length !== 1 ? "s" : ""} já atribuída{usedClassrooms.length !== 1 ? "s" : ""} a outros coordenadores
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            {SERIES.map((section) => {
              const expanded = expandedSections[section.id] ?? false;
              const allAvailInSection = section.years.flatMap((y) => getAvailableClassrooms(y, getClassCount(y)));
              const selectedInSection = allAvailInSection.filter((n) => selectedClassrooms.includes(n));
              const allSelected = allAvailInSection.length > 0 && allAvailInSection.every((n) => selectedClassrooms.includes(n));

              return (
                <div key={section.id} className="border rounded-xl overflow-hidden">
                  {/* Cabeçalho da seção */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpandedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-900 text-sm">{section.label}</span>
                      {selectedInSection.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {selectedInSection.length} selecionada{selectedInSection.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {expanded && allAvailInSection.length > 0 && (
                        <button
                          type="button"
                          className="text-xs text-blue-600 hover:underline mr-2"
                          onClick={(e) => { e.stopPropagation(); toggleSection(section.id, section.years); }}
                        >
                          {allSelected ? "Desmarcar todos" : "Selecionar todos"}
                        </button>
                      )}
                      {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Conteúdo expandível */}
                  {expanded && (
                    <div className="border-t bg-gray-50 p-4 space-y-4">
                      {section.years.map((year) => {
                        const count = getClassCount(year);
                        const turmas = CLASSES.slice(0, count).map((c) => `${year} ${c}`);
                        const availTurmas = turmas.filter((n) => !usedSet.has(n));

                        return (
                          <div key={year} className="space-y-2">
                            {/* Linha do ano com controle de quantidade */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{year}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Turmas na escola:</span>
                                <div className="flex items-center border rounded-md overflow-hidden bg-white">
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm font-bold transition"
                                    onClick={() => setClassCountPerYear((prev) => ({ ...prev, [year]: Math.max(1, (prev[year] ?? 4) - 1) }))}
                                  >−</button>
                                  <span className="px-3 py-1 text-sm font-semibold w-8 text-center">{count}</span>
                                  <button
                                    type="button"
                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm font-bold transition"
                                    onClick={() => setClassCountPerYear((prev) => ({ ...prev, [year]: Math.min(4, (prev[year] ?? 4) + 1) }))}
                                  >+</button>
                                </div>
                              </div>
                            </div>

                            {/* Checkboxes das turmas */}
                            <div className="grid grid-cols-4 gap-1.5">
                              {CLASSES.slice(0, count).map((c) => {
                                const name = `${year} ${c}`;
                                const unavail = usedSet.has(name);
                                const selected = selectedClassrooms.includes(name);

                                return unavail ? (
                                  <div
                                    key={name}
                                    className="flex items-center justify-center gap-1 p-2 border border-gray-200 rounded-lg bg-gray-100 opacity-50 cursor-not-allowed"
                                    title="Atribuída a outro coordenador"
                                  >
                                    <Lock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-400 line-through">{name}</span>
                                  </div>
                                ) : (
                                  <div
                                    key={name}
                                    className={`flex items-center justify-center gap-1.5 p-2 border rounded-lg cursor-pointer transition text-xs font-medium ${
                                      selected ? "bg-blue-50 border-blue-400 text-blue-700" : "bg-white border-gray-200 hover:border-blue-300"
                                    }`}
                                    onClick={() => toggleClassroom(name)}
                                  >
                                    <Checkbox checked={selected} onCheckedChange={() => toggleClassroom(name)} className="w-3 h-3" />
                                    <span>{name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Rodapé */}
            <div className="bg-blue-50 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-blue-700">
                <strong>{selectedClassrooms.length}</strong> turma{selectedClassrooms.length !== 1 ? "s" : ""} selecionada{selectedClassrooms.length !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-blue-500">{totalAvailable} disponíve{totalAvailable !== 1 ? "is" : "l"}</span>
            </div>

            {totalAvailable === 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                <Lock className="w-4 h-4 flex-shrink-0" />
                Todas as turmas desta escola já foram atribuídas. Entre em contato com a Secretaria.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />{error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setLocation("/")} disabled={isLoading}>
                Voltar
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={selectedClassrooms.length === 0 || isLoading || totalAvailable === 0}
                onClick={handleSave}
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</>
                  : "Confirmar e Continuar"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
