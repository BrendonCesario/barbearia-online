import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Building2, Users, TrendingUp, LogOut, Shield, Search,
  Crown, Zap, Lock, Unlock, Plus, ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Barbershop {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  is_active: boolean;
  is_plan_active: boolean;
  phone: string | null;
  city: string | null;
  created_at: string;
}

const PLAN_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  basic: { label: "Básico", icon: Lock, color: "text-muted-foreground" },
  intermediario: { label: "Intermediário", icon: Zap, color: "text-blue-400" },
  premium: { label: "Premium", icon: Crown, color: "text-primary" },
};

const SuperAdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState<Barbershop[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, premium: 0 });

  const fetchShops = async () => {
    const { data, error } = await supabase
      .from("barbershops")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setShops(data as Barbershop[]);
      setStats({
        total: data.length,
        active: data.filter((s) => s.is_active).length,
        premium: data.filter((s) => s.plan_type === "premium").length,
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchShops(); }, []);

  const updatePlan = async (shopId: string, planType: string) => {
    const { error } = await supabase
      .from("barbershops")
      .update({ plan_type: planType as any })
      .eq("id", shopId);
    if (error) {
      toast({ title: "Erro ao atualizar plano", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plano atualizado!" });
      fetchShops();
    }
  };

  const togglePlanActive = async (shopId: string, current: boolean) => {
    const { error } = await supabase
      .from("barbershops")
      .update({ is_plan_active: !current })
      .eq("id", shopId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: current ? "Plano bloqueado" : "Plano ativado" });
      fetchShops();
    }
  };

  const toggleActive = async (shopId: string, current: boolean) => {
    const { error } = await supabase
      .from("barbershops")
      .update({ is_active: !current })
      .eq("id", shopId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: current ? "Barbearia desativada" : "Barbearia ativada" });
      fetchShops();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const filtered = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">Super Admin</h1>
              <p className="text-xs text-muted-foreground">Gerenciamento Global</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card p-5 rounded-xl border border-border/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Barbearias</p>
            </div>
          </div>
          <div className="bg-card p-5 rounded-xl border border-border/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Ativas</p>
            </div>
          </div>
          <div className="bg-card p-5 rounded-xl border border-border/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gradient">{stats.premium}</p>
              <p className="text-sm text-muted-foreground">Premium</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar barbearia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>
        </div>

        {/* Shops List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((shop) => {
              const plan = PLAN_LABELS[shop.plan_type] || PLAN_LABELS.basic;
              const PlanIcon = plan.icon;
              return (
                <div
                  key={shop.id}
                  className={`bg-card p-5 rounded-xl border transition-colors ${
                    !shop.is_plan_active ? "border-destructive/30 opacity-75" : "border-border/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{shop.name}</h3>
                        <p className="text-sm text-muted-foreground">/{shop.slug}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <PlanIcon className={`w-4 h-4 ${plan.color}`} />
                          <span className={`text-xs font-medium ${plan.color}`}>{plan.label}</span>
                          {!shop.is_plan_active && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                              Bloqueado
                            </span>
                          )}
                          {!shop.is_active && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              Inativa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Plan selector */}
                      <select
                        value={shop.plan_type}
                        onChange={(e) => updatePlan(shop.id, e.target.value)}
                        className="bg-background border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground"
                      >
                        <option value="basic">Básico</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="premium">Premium</option>
                      </select>

                      <Button
                        variant={shop.is_plan_active ? "outline" : "gold"}
                        size="sm"
                        onClick={() => togglePlanActive(shop.id, shop.is_plan_active)}
                      >
                        {shop.is_plan_active ? (
                          <><Lock className="w-4 h-4 mr-1" /> Bloquear</>
                        ) : (
                          <><Unlock className="w-4 h-4 mr-1" /> Desbloquear</>
                        )}
                      </Button>

                      <Button
                        variant={shop.is_active ? "destructive" : "secondary"}
                        size="sm"
                        onClick={() => toggleActive(shop.id, shop.is_active)}
                      >
                        {shop.is_active ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma barbearia encontrada.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
