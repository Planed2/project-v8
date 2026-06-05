import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function CadastroEscola() {
  const [schoolName, setSchoolName] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const createSchoolMutation = trpc.school.create.useMutation();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!schoolName.trim()) {
      setError("Digite o nome da escola");
      return;
    }

    try {
      const result = await createSchoolMutation.mutateAsync({ name: schoolName });
      // Armazenar o ID da escola no sessionStorage para usar na próxima página
      if (result && result.id) {
        sessionStorage.setItem("schoolId", result.id.toString());
        setLocation("/selecao-turmas");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar escola");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro da Instituição</CardTitle>
          <CardDescription>Informe o nome completo da sua escola</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContinue} className="space-y-4">
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo da Escola
              </label>
              <Input
                id="schoolName"
                type="text"
                placeholder="Ex: Escola Municipal João XXIII"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full"
                disabled={createSchoolMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-2">
                Exemplos: Escola Municipal João XXIII, Escola Estadual Tiradentes
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={createSchoolMutation.isPending}
            >
              {createSchoolMutation.isPending ? "Criando..." : "Continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
