// Barbershop business information
export const BARBERSHOP_INFO = {
  name: "Barbearia Clássica",
  tagline: "Tradição e Estilo desde 2010",
  address: "Rua XV de Novembro, 1234",
  neighborhood: "Centro",
  city: "Curitiba",
  state: "PR",
  zipCode: "80020-310",
  phone: "(41) 99999-8888",
  whatsapp: "5541999998888",
  email: "contato@barbearia-classica.com.br",
  workingHours: {
    weekdays: "Seg - Sex: 09:00 - 19:00",
    saturday: "Sáb: 09:00 - 17:00",
    sunday: "Dom: Fechado",
  },
};

// Services offered
export const SERVICES = [
  {
    id: "corte-classico",
    name: "Corte Clássico",
    description: "Corte tradicional com acabamento impecável",
    duration: 30, // minutes
    price: 45,
  },
  {
    id: "corte-degradee",
    name: "Corte Degradê",
    description: "Técnica moderna com transição suave",
    duration: 40,
    price: 55,
  },
  {
    id: "barba-completa",
    name: "Barba Completa",
    description: "Modelagem e hidratação da barba",
    duration: 30,
    price: 35,
  },
  {
    id: "corte-barba",
    name: "Corte + Barba",
    description: "Combo completo com desconto especial",
    duration: 60,
    price: 70,
  },
  {
    id: "nevou",
    name: "Nevou",
    description: "Platinado completo com tratamento",
    duration: 90,
    price: 150,
  },
  {
    id: "pigmentacao",
    name: "Pigmentação",
    description: "Cobertura de fios brancos natural",
    duration: 45,
    price: 60,
  },
  {
    id: "hidratacao",
    name: "Hidratação Capilar",
    description: "Tratamento profundo para cabelos",
    duration: 30,
    price: 40,
  },
  {
    id: "sobrancelha",
    name: "Design de Sobrancelha",
    description: "Modelagem e alinhamento",
    duration: 15,
    price: 20,
  },
];

// Business hours configuration
export const BUSINESS_HOURS = {
  monday: { open: "09:00", close: "19:00", isOpen: true },
  tuesday: { open: "09:00", close: "19:00", isOpen: true },
  wednesday: { open: "09:00", close: "19:00", isOpen: true },
  thursday: { open: "09:00", close: "19:00", isOpen: true },
  friday: { open: "09:00", close: "19:00", isOpen: true },
  saturday: { open: "09:00", close: "17:00", isOpen: true },
  sunday: { open: "09:00", close: "17:00", isOpen: false },
};

// Booking rules
export const BOOKING_RULES = {
  bufferMinutes: 10, // Buffer between appointments
  minAdvanceHours: 1, // Minimum hours in advance to book
  maxAdvanceDays: 30, // Maximum days in advance to book
  cancellationHours: 24, // Hours before appointment to allow cancellation
};

// Time slots generation
export const TIME_SLOT_INTERVAL = 30; // minutes

// Format currency to BRL
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

// Format phone number
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Validate Brazilian phone
export const isValidBrazilianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 || cleaned.length === 11;
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
