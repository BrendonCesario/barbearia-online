import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const PainelRouter = () => {
  const { loading, isSuperAdmin, shopMembership } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isSuperAdmin) return <Navigate to="/super-admin" replace />;
  if (shopMembership) return <Navigate to="/shop-admin" replace />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center bg-card p-8 rounded-xl border border-border/50 max-w-md">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sem Acesso</h2>
        <p className="text-muted-foreground">
          Sua conta não está vinculada a nenhuma barbearia ou permissão administrativa.
        </p>
      </div>
    </div>
  );
};

export default PainelRouter;
