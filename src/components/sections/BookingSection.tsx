import { useState } from "react";
import { format, addDays, isBefore, startOfDay, isToday, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVICES, BUSINESS_HOURS, formatPrice, formatPhone, isValidBrazilianPhone, isValidEmail } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

// Generate time slots for a given day
const generateTimeSlots = (date: Date, serviceDuration: number) => {
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
  const dayName = dayNames[getDay(date)];
  const hours = BUSINESS_HOURS[dayName];

  if (!hours.isOpen) return [];

  const slots: string[] = [];
  const [openHour, openMinute] = hours.open.split(":").map(Number);
  const [closeHour, closeMinute] = hours.close.split(":").map(Number);

  let currentHour = openHour;
  let currentMinute = openMinute;

  while (currentHour * 60 + currentMinute + serviceDuration <= closeHour * 60 + closeMinute) {
    const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
    slots.push(timeString);

    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }

  // Filter out past slots if today
  if (isToday(date)) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    return slots.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      return h * 60 + m > currentTime + 60; // At least 1 hour in advance
    });
  }

  return slots;
};

// Generate next 30 days
const generateDays = () => {
  const days: Date[] = [];
  for (let i = 0; i < 30; i++) {
    days.push(addDays(startOfDay(new Date()), i));
  }
  return days;
};

type BookingStep = "service" | "datetime" | "info" | "confirm";

const BookingSection = () => {
  const [step, setStep] = useState<BookingStep>("service");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = generateDays();
  const service = SERVICES.find((s) => s.id === selectedService);
  const timeSlots = selectedDate && service ? generateTimeSlots(selectedDate, service.duration) : [];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep("datetime");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("info");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // Format phone as user types
      const cleaned = value.replace(/\D/g, "");
      let formatted = cleaned;
      if (cleaned.length >= 2) {
        formatted = `(${cleaned.slice(0, 2)}`;
        if (cleaned.length >= 7) {
          formatted += `) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
        } else if (cleaned.length >= 3) {
          formatted += `) ${cleaned.slice(2)}`;
        }
      }
      setFormData((prev) => ({ ...prev, phone: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return false;
    }
    if (!isValidBrazilianPhone(formData.phone)) {
      toast({ title: "Telefone inválido", description: "Use o formato (XX) XXXXX-XXXX", variant: "destructive" });
      return false;
    }
    if (!isValidEmail(formData.email)) {
      toast({ title: "E-mail inválido", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmitInfo = () => {
    if (validateForm()) {
      setStep("confirm");
    }
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Agendamento Confirmado! ✂️",
      description: `${service?.name} em ${selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : ""} às ${selectedTime}`,
    });

    // Reset form
    setStep("service");
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setFormData({ name: "", phone: "", email: "" });
    setIsSubmitting(false);
  };

  const goBack = () => {
    if (step === "datetime") setStep("service");
    else if (step === "info") setStep("datetime");
    else if (step === "confirm") setStep("info");
  };

  return (
    <section id="agendar" className="py-20 md:py-32 bg-card relative">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block text-sm font-medium text-primary mb-4 tracking-wider uppercase">
            Agendamento Online
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Agende seu <span className="text-gradient">Horário</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o serviço, data e horário de sua preferência.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {(["service", "datetime", "info", "confirm"] as const).map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    step === s
                      ? "bg-gold-gradient text-primary-foreground"
                      : (["service", "datetime", "info", "confirm"] as const).indexOf(step) > i
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {(["service", "datetime", "info", "confirm"] as const).indexOf(step) > i ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                      (["service", "datetime", "info", "confirm"] as const).indexOf(step) > i
                        ? "bg-primary/40"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={step === "service" ? "text-primary" : ""}>Serviço</span>
            <span className={step === "datetime" ? "text-primary" : ""}>Data/Hora</span>
            <span className={step === "info" ? "text-primary" : ""}>Dados</span>
            <span className={step === "confirm" ? "text-primary" : ""}>Confirmar</span>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {step !== "service" && (
            <Button variant="ghost" onClick={goBack} className="mb-6">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}

          {/* Step 1: Service Selection */}
          {step === "service" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleServiceSelect(s.id)}
                  className={`p-6 rounded-xl border text-left transition-all hover-lift ${
                    selectedService === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-background/50 hover:border-primary/40"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {s.name}
                    </h3>
                    <span className="text-lg font-bold text-gradient">{formatPrice(s.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{s.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    {s.duration} minutos
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === "datetime" && service && (
            <div className="space-y-8 animate-fade-in">
              {/* Date Selection */}
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Escolha a Data
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
                  {days.map((day) => {
                    const dayName = format(day, "EEE", { locale: ptBR });
                    const dayNum = format(day, "dd");
                    const monthName = format(day, "MMM", { locale: ptBR });
                    const dayIndex = getDay(day);
                    const isOpen = BUSINESS_HOURS[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][dayIndex] as keyof typeof BUSINESS_HOURS].isOpen;

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => isOpen && handleDateSelect(day)}
                        disabled={!isOpen}
                        className={`flex-shrink-0 w-16 py-3 px-2 rounded-xl text-center transition-all ${
                          selectedDate?.toDateString() === day.toDateString()
                            ? "bg-gold-gradient text-primary-foreground"
                            : isOpen
                            ? "bg-background/50 border border-border/50 hover:border-primary/40 text-foreground"
                            : "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
                        }`}
                      >
                        <p className="text-xs uppercase opacity-70">{dayName}</p>
                        <p className="text-xl font-bold">{dayNum}</p>
                        <p className="text-xs uppercase">{monthName}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Escolha o Horário
                  </h3>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className={`py-3 px-4 rounded-lg text-center font-medium transition-all ${
                            selectedTime === time
                              ? "bg-gold-gradient text-primary-foreground"
                              : "bg-background/50 border border-border/50 hover:border-primary/40 text-foreground"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum horário disponível para esta data.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Customer Info */}
          {step === "info" && (
            <div className="max-w-md mx-auto space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Telefone (WhatsApp)
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(41) 99999-8888"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <Button
                variant="gold"
                size="lg"
                className="w-full mt-8"
                onClick={handleSubmitInfo}
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirm" && service && selectedDate && selectedTime && (
            <div className="max-w-md mx-auto animate-fade-in">
              <div className="bg-background/50 rounded-xl p-6 border border-border/50 space-y-4 mb-8">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  Resumo do Agendamento
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviço:</span>
                    <span className="font-medium text-foreground">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium text-foreground">
                      {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-medium text-foreground">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium text-foreground">{service.duration} min</span>
                  </div>
                  <div className="border-t border-border/50 pt-3 flex justify-between">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-display text-xl font-bold text-gradient">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Cliente:</strong> {formData.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Telefone:</strong> {formData.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">E-mail:</strong> {formData.email}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center mb-6">
                Você receberá uma confirmação por e-mail e WhatsApp.
              </p>

              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
