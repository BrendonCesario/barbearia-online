import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Scissors,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  XCircle,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICES, formatPrice, BARBERSHOP_INFO } from "@/lib/constants";
import { useNavigate } from "react-router-dom";

// Mock appointments data
const mockAppointments = [
  {
    id: "1",
    clientName: "João Silva",
    clientPhone: "(41) 99999-1111",
    clientEmail: "joao@email.com",
    serviceId: "corte-barba",
    date: new Date(),
    time: "10:00",
    status: "confirmed",
  },
  {
    id: "2",
    clientName: "Pedro Santos",
    clientPhone: "(41) 99999-2222",
    clientEmail: "pedro@email.com",
    serviceId: "corte-classico",
    date: new Date(),
    time: "11:00",
    status: "confirmed",
  },
  {
    id: "3",
    clientName: "Lucas Oliveira",
    clientPhone: "(41) 99999-3333",
    clientEmail: "lucas@email.com",
    serviceId: "barba-completa",
    date: new Date(),
    time: "14:00",
    status: "pending",
  },
  {
    id: "4",
    clientName: "Carlos Ferreira",
    clientPhone: "(41) 99999-4444",
    clientEmail: "carlos@email.com",
    serviceId: "nevou",
    date: addDays(new Date(), 1),
    time: "09:00",
    status: "confirmed",
  },
];

type TabType = "agenda" | "servicos" | "configuracoes";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("agenda");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const todayAppointments = mockAppointments.filter(
    (apt) => isSameDay(apt.date, selectedDate)
  );

  const stats = {
    todayCount: mockAppointments.filter((apt) => isSameDay(apt.date, new Date())).length,
    weekCount: mockAppointments.length,
    monthRevenue: mockAppointments.reduce((acc, apt) => {
      const service = SERVICES.find((s) => s.id === apt.serviceId);
      return acc + (service?.price || 0);
    }, 0),
    pendingCount: mockAppointments.filter((apt) => apt.status === "pending").length,
  };

  const handleLogout = () => {
    navigate("/admin");
  };

  const getServiceName = (serviceId: string) => {
    return SERVICES.find((s) => s.id === serviceId)?.name || serviceId;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">
                  {BARBERSHOP_INFO.name}
                </h2>
                <p className="text-xs text-muted-foreground">Painel Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab("agenda")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "agenda"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Calendar className="w-5 h-5" />
              Agenda
            </button>
            <button
              onClick={() => setActiveTab("servicos")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "servicos"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Scissors className="w-5 h-5" />
              Serviços
            </button>
            <button
              onClick={() => setActiveTab("configuracoes")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "configuracoes"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Settings className="w-5 h-5" />
              Configurações
            </button>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-foreground"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="font-display text-xl font-semibold text-foreground capitalize">
                {activeTab}
              </h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {activeTab === "agenda" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-card p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.todayCount}</p>
                      <p className="text-xs text-muted-foreground">Hoje</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.weekCount}</p>
                      <p className="text-xs text-muted-foreground">Esta semana</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gradient">{formatPrice(stats.monthRevenue)}</p>
                      <p className="text-xs text-muted-foreground">Receita</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.pendingCount}</p>
                      <p className="text-xs text-muted-foreground">Pendentes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Week Calendar */}
              <div className="bg-card p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-foreground">Calendário Semanal</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`p-1.5 sm:p-3 rounded-lg text-center transition-colors ${
                        isSameDay(day, selectedDate)
                          ? "bg-gold-gradient text-primary-foreground"
                          : isSameDay(day, new Date())
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-[10px] sm:text-xs uppercase opacity-70">
                        {format(day, "EEE", { locale: ptBR })}
                      </p>
                      <p className="text-sm sm:text-lg font-bold">{format(day, "dd")}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Appointments List */}
              <div className="bg-card rounded-xl border border-border/50">
                <div className="p-4 border-b border-border">
                  <h3 className="font-display font-semibold text-foreground">
                    Agendamentos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {todayAppointments.length > 0 ? (
                     todayAppointments.map((apt) => (
                      <div key={apt.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-base sm:text-lg font-bold text-primary">
                              {apt.clientName.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm sm:text-base truncate">{apt.clientName}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {getServiceName(apt.serviceId)}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {apt.clientPhone}
                              </span>
                              <span className="hidden sm:flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {apt.clientEmail}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 ml-13 sm:ml-0">
                          <div className="text-left sm:text-right">
                            <p className="text-base sm:text-lg font-bold text-primary">{apt.time}</p>
                            <span
                              className={`text-xs px-2 py-0.5 sm:py-1 rounded-full ${
                                apt.status === "confirmed"
                                  ? "bg-success/10 text-success"
                                  : "bg-amber-500/10 text-amber-500"
                              }`}
                            >
                              {apt.status === "confirmed" ? "Confirmado" : "Pendente"}
                            </span>
                          </div>
                          <div className="flex gap-1 sm:gap-2">
                            <Button variant="ghost" size="icon" className="text-success hover:text-success h-8 w-8 sm:h-10 sm:w-10">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 sm:h-10 sm:w-10">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum agendamento para esta data.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "servicos" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Gerenciar Serviços
                </h2>
                <Button variant="gold">+ Novo Serviço</Button>
              </div>
              <div className="grid gap-4">
                {SERVICES.map((service) => (
                  <div
                    key={service.id}
                    className="bg-card p-4 rounded-xl border border-border/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Scissors className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-muted-foreground">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {service.duration} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gradient">{formatPrice(service.price)}</p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "configuracoes" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Configurações
              </h2>
              <div className="bg-card p-6 rounded-xl border border-border/50 space-y-4">
                <h3 className="font-semibold text-foreground">Horário de Funcionamento</h3>
                <p className="text-sm text-muted-foreground">
                  Configure os horários de abertura e fechamento para cada dia da semana.
                </p>
                <div className="grid gap-3">
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map(
                    (day) => (
                      <div key={day} className="flex items-center justify-between py-2 border-b border-border/30">
                        <span className="text-foreground">{day}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">09:00 - 19:00</span>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border/50 space-y-4">
                <h3 className="font-semibold text-foreground">Bloqueio de Horários</h3>
                <p className="text-sm text-muted-foreground">
                  Bloqueie dias ou horários específicos (férias, folgas, etc.)
                </p>
                <Button variant="outline">+ Adicionar Bloqueio</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
