import { Clock, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICES, formatPrice } from "@/lib/constants";

interface ServiceCardProps {
  service: (typeof SERVICES)[0];
  index: number;
}

const ServiceCard = ({ service, index }: ServiceCardProps) => {
  return (
    <div
      className="group relative bg-card-gradient rounded-xl p-6 border border-border/50 hover:border-primary/40 transition-all duration-300 hover-lift"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Popular badge for featured services */}
      {service.id === "corte-barba" && (
        <div className="absolute -top-3 right-4 px-3 py-1 bg-gold-gradient rounded-full">
          <span className="text-xs font-semibold text-primary-foreground">
            Mais Popular
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Scissors className="w-6 h-6 text-primary" />
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-gradient">
            {formatPrice(service.price)}
          </p>
        </div>
      </div>

      <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {service.name}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {service.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          {service.duration} min
        </div>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <a href="#agendar">Agendar →</a>
        </Button>
      </div>
    </div>
  );
};

const ServicesSection = () => {
  return (
    <section id="servicos" className="py-20 md:py-32 bg-background relative">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-block text-sm font-medium text-primary mb-4 tracking-wider uppercase">
            Nossos Serviços
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Serviços <span className="text-gradient">Premium</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Cada serviço é executado com precisão e atenção aos detalhes,
            garantindo resultados impecáveis.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Não encontrou o que procura? Entre em contato para serviços
            personalizados.
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href="#contato">Fale Conosco</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
