import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Scissors, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShopInfo {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
}

const ShopPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      const { data: shopData, error } = await supabase
        .from("barbershops")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error || !shopData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setShop(shopData as ShopInfo);

      const [servRes, barbRes] = await Promise.all([
        supabase.from("services").select("*").eq("barbershop_id", shopData.id).eq("is_active", true).order("sort_order"),
        supabase.from("barbers").select("*").eq("barbershop_id", shopData.id).eq("is_active", true),
      ]);

      if (servRes.data) setServices(servRes.data);
      if (barbRes.data) setBarbers(barbRes.data);
      setLoading(false);
    };

    fetchShop();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">Barbearia não encontrada</h1>
          <p className="text-muted-foreground mb-6">O link que você acessou não corresponde a nenhuma barbearia ativa.</p>
          <Button variant="gold" onClick={() => window.location.href = "/"}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold">
              <Scissors className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">{shop?.name}</h1>
              {shop?.city && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" /> {shop.address}, {shop.city}/{shop.state}
                </p>
              )}
              {shop?.phone && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {shop.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Services */}
        <section>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Serviços</h2>
          {services.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((s) => (
                <div key={s.id} className="bg-card p-5 rounded-xl border border-border/50 hover-lift gold-border-hover">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{s.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.duration} min
                      </p>
                    </div>
                    <p className="text-xl font-bold text-gradient whitespace-nowrap">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(s.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum serviço disponível no momento.</p>
          )}
        </section>

        {/* Barbers */}
        {barbers.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Nossos Barbeiros</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {barbers.map((b) => (
                <div key={b.id} className="bg-card p-5 rounded-xl border border-border/50 text-center hover-lift">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-primary">{b.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{b.name}</h3>
                  {b.specialty && <p className="text-sm text-muted-foreground">{b.specialty}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ShopPage;
