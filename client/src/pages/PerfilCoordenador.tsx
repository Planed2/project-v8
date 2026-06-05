import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { AlertCircle } from "lucide-react";

export default function PerfilCoordenador() {
  const [coordinatorName, setCoordinatorName] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const schoolId = parseInt(sessionStorage.getItem("selectedSchoolId") || "0");
  const schoolName = sessionStorage.getItem("selectedSchoolName") || "";

  const createCoordinatorMutation = trpc.coordinator.create.useMutation();

  useEffect(() => {
    if (!schoolId || !schoolName) {
      setLocation("/");
    }
  }, [schoolId, schoolName, setLocation]);

  const handleCreateCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!coordinatorName.trim()) {
      setError("Digite o nome do coordenador");
      return;
    }

    try {
      const coordinator = await createCoordinatorMutation.mutateAsync({
        schoolId,
        name: coordinatorName.trim(),
      });

      if (coordinator) {
        sessionStorage.setItem("coordinatorId", coordinator.id.toString());
        sessionStorage.setItem("coordinatorName", coordinator.name);
        setLocation("/selecao-turmas");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar coordenador");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              IF
            </div>
          </div>
          <CardTitle className="text-2xl">Perfil do Coordenador</CardTitle>
          <CardDescription>{schoolName}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCoordinator} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Coordenador
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
                className="w-full"
                disabled={createCoordinatorMutation.isPending}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={createCoordinatorMutation.isPending}
            >
              {createCoordinatorMutation.isPending ? "Criando..." : "Continuar"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                sessionStorage.removeItem("selectedSchoolId");
                sessionStorage.removeItem("selectedSchoolName");
                setLocation("/");
              }}
              className="w-full"
            >
              Voltar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
