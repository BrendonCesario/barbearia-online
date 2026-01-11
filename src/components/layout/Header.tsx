import { useState } from "react";
import { Menu, X, Scissors, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BARBERSHOP_INFO } from "@/lib/constants";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#inicio", label: "Início" },
    { href: "#servicos", label: "Serviços" },
    { href: "#agendar", label: "Agendar" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-semibold text-foreground">
                {BARBERSHOP_INFO.name}
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                {BARBERSHOP_INFO.city}/{BARBERSHOP_INFO.state}
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${BARBERSHOP_INFO.phone}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              {BARBERSHOP_INFO.phone}
            </a>
            <Button variant="gold" size="sm" asChild>
              <a href="#agendar">Agendar Horário</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 px-4 space-y-3">
                <a
                  href={`tel:${BARBERSHOP_INFO.phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  {BARBERSHOP_INFO.phone}
                </a>
                <a
                  href={`https://maps.google.com/?q=${BARBERSHOP_INFO.address}, ${BARBERSHOP_INFO.city}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  {BARBERSHOP_INFO.address}
                </a>
                <Button variant="gold" className="w-full" asChild>
                  <a href="#agendar" onClick={() => setIsMenuOpen(false)}>
                    Agendar Horário
                  </a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
