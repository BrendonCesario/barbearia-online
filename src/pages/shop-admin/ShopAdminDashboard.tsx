import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Calendar, Clock, Users, Scissors, Settings, LogOut, Menu, X,
  TrendingUp, Crown, Lock, Plus, BarChart3, Image,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TabType = "agenda" | "barbeiros" | "servicos" | "configuracoes";

interface ShopData {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  is_plan_active: boolean;
  is_active: boolean;
}

const PLAN_FEATURES: Record<string, { label: string; agenda: boolean; relatorios: boolean; fotos: boolean }> = {
  basic: { label: "Básico", agenda: false, relatorios: false, fotos: false },
  intermediario: { label: "Intermediário", agenda: true, relatorios: false, fotos: false },
  premium: { label: "Premium", agenda: true, relatorios: true, fotos: true },
};

const ShopAdminDashboard = () => {
  const { signOut, shopMembership, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("agenda");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shop, setShop] = useState<ShopData | null>(null);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const barbershopId = shopMembership?.barbershop_id;

  useEffect(() => {
    if (!barbershopId) return;

    const fetchData = async () => {
      const [shopRes, barbersRes, servicesRes] = await Promise.all([
        supabase.from("barbershops").select("*").eq("id", barbershopId).single(),
        supabase.from("barbers").select("*").eq("barbershop_id", barbershopId).eq("is_active", true),
        supabase.from("services").select("*").eq("barbershop_id", barbershopId).eq("is_active", true).order("sort_order"),
      ]);

      if (shopRes.data) setShop(shopRes.data as ShopData);
      if (barbersRes.data) setBarbers(barbersRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      setLoading(false);
    };

    fetchData();
  }, [barbershopId]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Plan blocked screen
  if (shop && !shop.is_plan_active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center bg-card p-8 rounded-xl border border-destructive/30 max-w-md">
          <Lock className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-4">
            O plano da barbearia <strong>{shop.name}</strong> não está ativo.
            Entre em contato com o administrador para reativar.
          </p>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </div>
    );
  }

  const features = PLAN_FEATURES[shop?.plan_type || "basic"] || PLAN_FEATURES.basic;

  const navItems = [
    { id: "agenda" as TabType, icon: Calendar, label: "Agenda", enabled: features.agenda },
    { id: "barbeiros" as TabType, icon: Users, label: "Barbeiros", enabled: true },
    { id: "servicos" as TabType, icon: Scissors, label: "Serviços", enabled: true },
    { id: "configuracoes" as TabType, icon: Settings, label: "Configurações", enabled: true },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground truncate">{shop?.name}</h2>
                <div className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-primary" />
                  <p className="text-xs text-primary">{features.label}</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.enabled) {
                    toast({
                      title: "Recurso indisponível",
                      description: "Faça upgrade do plano para acessar este recurso.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  !item.enabled
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : activeTab === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {!item.enabled && <Lock className="w-3 h-3 ml-auto" />}
              </button>
            ))}

            {/* Premium-only items */}
            <button
              onClick={() => {
                if (!features.relatorios) {
                  toast({ title: "Exclusivo Premium", description: "Relatórios financeiros são exclusivos do plano Premium.", variant: "destructive" });
                  return;
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                !features.relatorios ? "text-muted-foreground/40 cursor-not-allowed" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Relatórios
              {!features.relatorios && <Lock className="w-3 h-3 ml-auto" />}
            </button>

            <button
              onClick={() => {
                if (!features.fotos) {
                  toast({ title: "Exclusivo Premium", description: "Catálogo de fotos é exclusivo do plano Premium.", variant: "destructive" });
                  return;
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                !features.fotos ? "text-muted-foreground/40 cursor-not-allowed" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Image className="w-5 h-5" />
              Catálogo
              {!features.fotos && <Lock className="w-3 h-3 ml-auto" />}
            </button>
          </nav>

          <div className="p-4 border-t border-border">
            {isSuperAdmin && (
              <button
                onClick={() => navigate("/super-admin")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors mb-2"
              >
                <TrendingUp className="w-5 h-5" /> Super Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" /> Sair
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-foreground">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="font-display text-xl font-semibold text-foreground capitalize">{activeTab}</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {activeTab === "agenda" && !features.agenda && (
            <UpgradeCard feature="Agendamentos" description="Faça upgrade para o plano Intermediário ou Premium para habilitar o sistema de agendamentos." />
          )}

          {activeTab === "agenda" && features.agenda && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Agenda</h3>
              <p>Gerencie seus agendamentos aqui.</p>
            </div>
          )}

          {activeTab === "barbeiros" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-display text-2xl font-bold text-foreground">Barbeiros</h2>
                <Button variant="gold" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>
              {barbers.length > 0 ? (
                <div className="grid gap-4">
                  {barbers.map((b) => (
                    <div key={b.id} className="bg-card p-4 rounded-xl border border-border/50 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{b.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{b.name}</h3>
                        <p className="text-sm text-muted-foreground">{b.specialty || "Sem especialidade"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum barbeiro cadastrado.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "servicos" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-display text-2xl font-bold text-foreground">Serviços</h2>
                <Button variant="gold" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Novo Serviço
                </Button>
              </div>
              {services.length > 0 ? (
                <div className="grid gap-4">
                  {services.map((s) => (
                    <div key={s.id} className="bg-card p-4 rounded-xl border border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Scissors className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{s.name}</h3>
                          <p className="text-sm text-muted-foreground">{s.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />{s.duration} min
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gradient">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(s.price)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Scissors className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum serviço cadastrado.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "configuracoes" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Configurações</h2>
              <div className="bg-card p-6 rounded-xl border border-border/50">
                <h3 className="font-semibold text-foreground mb-4">Informações da Barbearia</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Nome:</span> <span className="text-foreground ml-2">{shop?.name}</span></div>
                  <div><span className="text-muted-foreground">Slug:</span> <span className="text-foreground ml-2">/{shop?.slug}</span></div>
                  <div><span className="text-muted-foreground">Plano:</span> <span className="text-foreground ml-2">{features.label}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className="text-foreground ml-2">{shop?.is_active ? "Ativa" : "Inativa"}</span></div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border/50">
                <h3 className="font-semibold text-foreground mb-3">Recursos do Plano</h3>
                <div className="space-y-2">
                  {[
                    { label: "Agendamentos", enabled: features.agenda },
                    { label: "Relatórios Financeiros", enabled: features.relatorios },
                    { label: "Catálogo de Fotos", enabled: features.fotos },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 text-sm">
                      {f.enabled ? (
                        <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-success" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className={f.enabled ? "text-foreground" : "text-muted-foreground"}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const UpgradeCard = ({ feature, description }: { feature: string; description: string }) => (
  <div className="text-center py-12 bg-card rounded-xl border border-primary/20 p-8">
    <Crown className="w-16 h-16 text-primary mx-auto mb-4" />
    <h3 className="font-display text-xl font-bold text-foreground mb-2">{feature}</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
    <Button variant="gold">Solicitar Upgrade</Button>
  </div>
);

export default ShopAdminDashboard;
