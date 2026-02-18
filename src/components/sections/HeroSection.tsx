import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BARBERSHOP_INFO } from "@/lib/constants";
import heroBg from "@/assets/hero-barbershop.jpg";

const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Interior da barbearia" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-4 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-4 md:right-10 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm text-primary font-medium">
              {BARBERSHOP_INFO.tagline}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            <span className="text-foreground">A Arte do </span>
            <span className="text-gradient">Corte Perfeito</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Experimente o melhor em barbearia masculina. Profissionais qualificados,
            ambiente exclusivo e atendimento personalizado no coração de{" "}
            <span className="text-foreground">{BARBERSHOP_INFO.city}</span>.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button variant="hero" size="xl" asChild>
              <a href="#agendar" className="group">
                Agendar Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <a href="#servicos">Ver Serviços</a>
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto mt-10 sm:mt-16 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-center">
              <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">
                14+
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Anos de Experiência</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">
                5.0
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Avaliação Google</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-gradient">
                10K+
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Clientes Atendidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
