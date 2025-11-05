import React, { useMemo, useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Info,
  AlertTriangle,
  TrendingUp,
  CalendarDays,
  Send,
  Sparkles,
  MessageCircle,
  Bell,
  ExternalLink,
  Filter,
  PlugZap,
  ShieldCheck,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * LAC Executive Control Tower — Anteprima (UI mock)
 * Include filtri Genere/Venue con opzioni reali e logo ufficiale.
 * Test runtime leggeri per filtro, funnelNorm e somma mix ricavi.
 */

const brand = {
  primary: "#231F20",
  gray700: "#534F50",
  gray500: "#8C8A8B",
  gray300: "#CBCACA",
  bg: "#F5F5F5",
};

type Risk = "low" | "mid" | "high";

type EventItem = {
  title: string;
  date: string;
  occupancy: number;
  risk: Risk;
  venue: string;
  genre: "Opera" | "Teatro" | "Danza" | "Musica" | "Family";
};

const baseKpi = [
  { label: "Occupazione serata (Eventim)", value: "72%", delta: "+6% vs LW", source: "Eventim Inhouse" },
  { label: "Ricavi Prevendite oggi", value: "CHF 48’200", delta: "+12% vs target", source: "Eventim Inhouse" },
  { label: "Eventi critici T-7/T-3", value: "3", delta: "2 a T-7 · 1 a T-3", source: "Eventim Inhouse" },
  { label: "Carrelli abbandonati", value: "62%", delta: "−4 pt vs 7 gg", source: "GA4 + Ticketing" },
  { label: "Prezzo medio biglietto", value: "CHF 58", delta: "+CHF 2 vs media", source: "Eventim Inhouse" },
  { label: "Allestimenti on-time (Ops)", value: "94%", delta: "−1 pt vs LW", source: "Momentus" },
  { label: "SLA sponsor (benefit)", value: "92%", delta: "on-time", source: "SharePoint" },
  { label: "NPS post-evento 30 gg", value: "+57", delta: "+3 pts", source: "Survey → CM" },
];

const salesSeries = [
  { day: "Lun", tickets: 420, revenue: 38000 },
  { day: "Mar", tickets: 510, revenue: 45200 },
  { day: "Mer", tickets: 465, revenue: 39900 },
  { day: "Gio", tickets: 610, revenue: 51200 },
  { day: "Ven", tickets: 780, revenue: 68400 },
  { day: "Sab", tickets: 920, revenue: 81200 },
  { day: "Dom", tickets: 690, revenue: 60300 },
];

const funnel = [
  { step: "Reach (GA4)", value: 120000 },
  { step: "Click (Meta/DEM)", value: 18300 },
  { step: "A2C (GA4/Magnolia)", value: 2900 },
  { step: "Purchase (Eventim)", value: 1950 },
];

const topEvents: EventItem[] = [
  { title: "Opera — Don Giovanni", date: "Ven 24", occupancy: 0.82, risk: "low", venue: "Sala Teatro", genre: "Opera" },
  { title: "Danza — Contemporary Mix", date: "Sab 25", occupancy: 0.61, risk: "mid", venue: "Sala 1", genre: "Danza" },
  { title: "Teatro — Classici d’Autunno", date: "Dom 26", occupancy: 0.44, risk: "high", venue: "Sala 2", genre: "Teatro" },
  { title: "Musica — Quartetto d’Archi", date: "Lun 27", occupancy: 0.53, risk: "mid", venue: "Hall", genre: "Musica" },
  { title: "Family — Favole al LAC", date: "Mar 28", occupancy: 0.39, risk: "high", venue: "Agorà", genre: "Family" },
];

const anomalyFeed = [
  { type: "Canale (GA4)", msg: "Calo conversione newsletter per ‘Classici d’Autunno’ (−31% vs 14 gg)", severity: "high" },
  { type: "Accessi (Ops)", msg: "Coda foyer segnalata; sentiment −12 in 48 h", severity: "mid" },
  { type: "Staff (Momentus)", msg: "Gap crew palco sabato (−2 tecnici luci)", severity: "mid" },
];

const revenueMix = [
  { name: "Biglietti", value: 62 },
  { name: "Sponsorship", value: 21 },
  { name: "Venue Rental", value: 9 },
  { name: "Merch & Altro", value: 8 },
];

const heatmapDays = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  slots: [
    { label: "Matt", value: Math.random(), ops: Math.random() < 0.15 },
    { label: "Pome", value: Math.random(), ops: Math.random() < 0.15 },
    { label: "Sera", value: Math.random(), ops: Math.random() < 0.15 },
  ],
}));

// --------------------------
// Helpers + lightweight tests
// --------------------------
function filterEvents(events: EventItem[], genre: string, venue: string) {
  return events.filter((e) => {
    const okG = genre ? e.genre?.toLowerCase() === genre.toLowerCase() : true;
    const okV = venue ? e.venue?.toLowerCase() === venue.toLowerCase() : true;
    return okG && okV;
  });
}

function computeFunnelNorm(items: { step: string; value: number }[]) {
  const max = Math.max(...items.map((f) => f.value));
  return items.map((f) => ({ ...f, pct: Math.round((f.value / max) * 100) }));
}

function runUnitTests() {
  try {
    console.assert(topEvents.length === 5, "[TEST] topEvents length should be 5");
    const onlyOpera = filterEvents(topEvents, "Opera", "");
    console.assert(onlyOpera.length === 1 && onlyOpera[0].genre === "Opera", "[TEST] filter by genre Opera");
    const sala1 = filterEvents(topEvents, "", "Sala 1");
    console.assert(sala1.length === 1 && sala1[0].venue === "Sala 1", "[TEST] filter by venue Sala 1");
    const danzaSala1 = filterEvents(topEvents, "Danza", "Sala 1");
    console.assert(
      danzaSala1.length === 1 && danzaSala1[0].genre === "Danza" && danzaSala1[0].venue === "Sala 1",
      "[TEST] combined filter"
    );
    const fn = computeFunnelNorm(funnel);
    console.assert(fn[0].pct === 100, "[TEST] funnelNorm first step should be 100%");
    const sumMix = revenueMix.reduce((a, b) => a + b.value, 0);
    console.assert(sumMix === 100, "[TEST] revenue mix should sum to 100");
  } catch (err) {
    console.error("[TEST] Fallback error", err);
  }
}

function RiskBadge({ risk }: { risk: Risk }) {
  const map = {
    low: { label: "Basso", class: "bg-emerald-100 text-emerald-700" },
    mid: { label: "Medio", class: "bg-amber-100 text-amber-700" },
    high: { label: "Alto", class: "bg-rose-100 text-rose-700" },
  } as const;
  return <Badge className={`${map[risk].class} font-medium`}>{map[risk].label}</Badge>;
}

function SourcePill({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full border"
      style={{ borderColor: brand.gray300, color: brand.gray700 }}
    >
      {label}
    </span>
  );
}

function LACLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <img
        src="https://iconape.com/wp-content/png_logo_vector/lac-lugano-arte-e-cultura-logo.png"
        alt="LAC Lugano Arte e Cultura"
        className="h-6 w-auto"
      />
      <div className="text-sm" style={{ color: brand.gray700 }}>
        Lugano Arte e Cultura
      </div>
    </div>
  );
}

export function ExecutiveControlTowerPreview() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "staff" | "incident">("overview");
  const [genre, setGenre] = useState("");
  const [venue, setVenue] = useState("");

  useEffect(() => {
    runUnitTests();
  }, []);

  const funnelNorm = useMemo(() => computeFunnelNorm(funnel), []);
  const filteredEvents = useMemo(() => filterEvents(topEvents, genre, venue), [genre, venue]);

  // Helpers calcolo KPI/Heatmap sensibili ai filtri
  const formatCHF = (n: number) =>
    new Intl.NumberFormat("it-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 })
      .format(n)
      .replace(/\u00A0/g, " ");

  const computedKpi = useMemo(() => {
    const total = topEvents.length;
    const active = filteredEvents.length;
    const hasFilter = !!genre || !!venue;
    const factor = hasFilter && total > 0 ? Math.max(0.15, active / total) : 1;

    const occAvg = active > 0
      ? Math.round((filteredEvents.reduce((a, b) => a + (b.occupancy || 0), 0) / active) * 100)
      : 72;

    const riskCount = active > 0 ? filteredEvents.filter((e) => (e.occupancy || 0) < 0.5).length : 3;
    const scaledRevenue = Math.round(48200 * factor);

    const updated = [
      { label: "Occupazione serata (Eventim)", value: `${occAvg}%`, delta: hasFilter ? "filtrato" : "+6% vs LW", source: "Eventim Inhouse" },
      { label: "Ricavi Prevendite oggi", value: formatCHF(scaledRevenue), delta: hasFilter ? "filtrato" : "+12% vs target", source: "Eventim Inhouse" },
      { label: "Eventi critici T-7/T-3", value: String(riskCount), delta: hasFilter ? "filtrato" : "2 a T-7 · 1 a T-3", source: "Eventim Inhouse" },
    ];

    const rest = baseKpi.slice(3);
    return [...updated, ...rest];
  }, [filteredEvents, genre, venue]);

  const heatmapFiltered = useMemo(() => {
    const total = topEvents.length;
    const active = filteredEvents.length;
    const hasFilter = !!genre || !!venue;
    const factor = hasFilter && total > 0 ? Math.max(0.2, active / total) : 1;
    return heatmapDays.map((d) => ({
      ...d,
      slots: d.slots.map((s) => ({ ...s, value: Math.min(1, s.value * (0.5 + 0.5 * factor)) })),
    }));
  }, [filteredEvents, genre, venue]);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: brand.bg, color: brand.primary }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{ backgroundColor: "rgba(255,255,255,0.85)", borderColor: brand.gray300 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <LACLogo />
          <div className="h-6 w-px mx-2" style={{ backgroundColor: brand.gray300 }} />
          <span className="text-sm" style={{ color: brand.gray700 }}>
            Executive Control Tower — Stagione Arti Performative 2025/26
          </span>
          <Badge className="ml-auto" style={{ backgroundColor: brand.gray300, color: brand.primary }}>
            ANTEPRIMA NON FUNZIONANTE
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Info className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mock interattivo con fonti dati mappate e filtri Genere/Venue.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Filtri */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: brand.gray700 }}>Genere</span>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">Tutti</option>
              <option value="Opera">Opera</option>
              <option value="Teatro">Teatro</option>
              <option value="Danza">Danza</option>
              <option value="Musica">Musica</option>
              <option value="Family">Family</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: brand.gray700 }}>Venue</span>
            <select
              className="border rounded-md px-2 py-1 text-sm"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            >
              <option value="">Tutte</option>
              <option value="Sala Teatro">Sala Teatro</option>
              <option value="Hall">Hall</option>
              <option value="Sala 1">Sala 1</option>
              <option value="Sala 2">Sala 2</option>
              <option value="Sala 3">Sala 3</option>
              <option value="Sala 4">Sala 4</option>
              <option value="Agorà">Agorà</option>
              <option value="Chiostro">Chiostro</option>
              <option value="Piazza">Piazza</option>
            </select>
          </div>

          {(genre || venue) && (
            <div className="flex items-center gap-2 flex-wrap">
              {genre && (
                <span
                  className="text-xs px-2 py-1 rounded-full border"
                  style={{ borderColor: brand.gray300, color: brand.gray700 }}
                >
                  Genere: {genre}
                </span>
              )}
              {venue && (
                <span
                  className="text-xs px-2 py-1 rounded-full border"
                  style={{ borderColor: brand.gray300, color: brand.gray700 }}
                >
                  Venue: {venue}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGenre("");
                  setVenue("");
                }}
              >
                Azzera filtri
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* KPI TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
        {(genre || venue) && <Badge className="bg-amber-100 text-amber-700">FILTRI ATTIVI</Badge>}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {computedKpi.map((k) => (
          <Card key={k.label} className="shadow-sm" style={{ borderColor: brand.gray300 }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium" style={{ color: brand.gray500 }}>
                {k.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold" style={{ color: brand.primary }}>
                {k.value}
              </div>
              <div className="text-sm mb-2" style={{ color: brand.gray500 }}>
                {k.delta}
              </div>
              {"source" in k && k.source ? <SourcePill label={k.source as string} /> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Digest AI */}
        <Card className="xl:col-span-2 shadow-sm" style={{ borderColor: brand.gray300 }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              3 cose da sapere oggi (Digest AI)
            </CardTitle>
            <div className="flex items-center gap-2">
              <SourcePill label="SharePoint + Teams (Graph)" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: brand.bg, color: brand.primary }}>
              Prevendite +12% vs target. <SourcePill label="Eventim" />
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: brand.bg, color: brand.primary }}>
              Occupazione 72% (Teatro 44% a rischio). <SourcePill label="Eventim" />
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: brand.bg, color: brand.primary }}>
              Sponsor: 2 benefit in scadenza ≤7g. <SourcePill label="SharePoint" />
            </div>
            <div className="pt-2 border-t mt-2" style={{ borderColor: brand.gray300 }}>
              <div className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Segnali di anomalia
              </div>
              <ul className="space-y-2">
                {anomalyFeed.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {a.type}
                    </Badge>
                    <span className={a.severity === "high" ? "text-rose-600" : ""}>{a.msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Stato integrazioni */}
        <Card className="shadow-sm" style={{ borderColor: brand.gray300 }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlugZap className="w-5 h-5" />
              Stato integrazioni (mock)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm" style={{ color: brand.gray700 }}>
            <div className="flex items-center justify-between">
              <span>Eventim Inhouse</span>
              <Badge className="bg-emerald-100 text-emerald-700">OK</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>GA4 (Data API)</span>
              <Badge className="bg-emerald-100 text-emerald-700">OK</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Meta (Insights)</span>
              <Badge className="bg-emerald-100 text-emerald-700">OK</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Campaign Monitor</span>
              <Badge className="bg-emerald-100 text-emerald-700">OK</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Momentus (Ops)</span>
              <Badge className="bg-amber-100 text-amber-700">Setup</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Dynamics 365 BC</span>
              <Badge className="bg-amber-100 text-amber-700">Setup</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Magnolia (CMS)</span>
              <Badge className="bg-emerald-100 text-emerald-700">OK</Badge>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs">
              <ShieldCheck className="w-4 h-4" />
              OAuth / SFTP / IP allowlist previsti in produzione.
            </div>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card className="xl:col-span-2 shadow-sm" style={{ borderColor: brand.gray300 }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Heatmap prossimi 14 giorni
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Filtri
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                Calendario LAC
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {heatmapFiltered.map((d) => (
                <div key={d.day} className="p-2 rounded-xl bg-white border" style={{ borderColor: brand.gray300 }}>
                  <div className="text-xs" style={{ color: brand.gray500 }}>
                    Giorno {d.day}
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1">
                    {d.slots.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-10 text-xs" style={{ color: brand.gray500 }}>
                          {s.label}
                        </span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: brand.gray300 }}>
                          <div className="h-3" style={{ width: `${Math.round(s.value * 100)}%`, backgroundColor: brand.primary }} />
                        </div>
                        {s.ops && <Badge className="ml-1 bg-amber-100 text-amber-700">OPS</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs mt-2" style={{ color: brand.gray500 }}>
              OPS indica criticità Momentus (staff/allestimenti) o meteo critico.
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Eventi */}
        <Card className="shadow-sm" style={{ borderColor: brand.gray300 }}>
          <CardHeader>
            <CardTitle>Top 5 eventi imminenti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredEvents.map((e) => (
              <div key={e.title} className="p-3 rounded-xl border bg-white flex items-center gap-3" style={{ borderColor: brand.gray300 }}>
                <div className="w-16 text-sm" style={{ color: brand.gray500 }}>{e.date}</div>
                <div className="flex-1">
                  <div className="font-medium" style={{ color: brand.primary }}>{e.title}</div>
                  <div className="text-xs" style={{ color: brand.gray500 }}>
                    Genere: {e.genre} · Venue: {e.venue}
                  </div>
                  <div className="text-sm" style={{ color: brand.gray500 }}>
                    Occupazione: {(e.occupancy * 100).toFixed(0)}%
                  </div>
                </div>
                <RiskBadge risk={e.risk} />
                <Button variant="outline" size="sm" disabled>
                  <Bell className="w-4 h-4 mr-1" />
                  Alert Teams (demo)
                </Button>
                <Button size="sm" disabled>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Bozza DEM CM (demo)
                </Button>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-sm" style={{ color: brand.gray500 }}>
                Nessun evento corrisponde ai filtri selezionati.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendite & Ricavi */}
        <Card className="xl:col-span-2 shadow-sm" style={{ borderColor: brand.gray300 }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Vendite & Ricavi (ultimi 7 giorni)</CardTitle>
            <SourcePill label="Eventim Inhouse" />
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RTooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="tickets" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funnel & Mix ricavi */}
        <Card className="shadow-sm" style={{ borderColor: brand.gray300 }}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Funnel — Top eventi</CardTitle>
            <div className="flex items-center gap-2">
              <SourcePill label="GA4" />
              <SourcePill label="Campaign Monitor" />
              <SourcePill label="Eventim" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelNorm.map((f) => (
                <div key={f.step}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{f.step}</span>
                    <span className="text-neutral-500">{f.value.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: brand.gray300 }}>
                    <div className="h-3" style={{ width: `${f.pct}%`, backgroundColor: brand.primary }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm" style={{ borderColor: brand.gray300 }}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Mix ricavi (ultimi 30 gg)</CardTitle>
            <SourcePill label="Eventim + Dynamics 365 BC" />
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueMix} dataKey="value" nameKey="name" outerRadius={90} label>
                  {revenueMix.map((_, idx) => (
                    <Cell key={idx} />
                  ))}
                </Pie>
                <Legend />
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operations */}
        <Card className="xl:col-span-3 shadow-sm" style={{ borderColor: brand.gray300 }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Operations Pulse (Momentus)
            </CardTitle>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="incident">Incident</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-white" style={{ borderColor: brand.gray300 }}>
                  <div className="text-sm" style={{ color: brand.gray500 }}>Allestimenti on-time</div>
                  <div className="text-2xl font-semibold">94%</div>
                  <div className="text-xs" style={{ color: brand.gray500 }}>−1 pt vs settimana scorsa</div>
                </div>
                <div className="p-4 rounded-xl border bg-white" style={{ borderColor: brand.gray300 }}>
                  <div className="text-sm" style={{ color: brand.gray500 }}>Straordinari (ore / 7 gg)</div>
                  <div className="text-2xl font-semibold">31h</div>
                  <div className="text-xs" style={{ color: brand.gray500 }}>−12% vs target</div>
                </div>
                <div className="p-4 rounded-xl border bg-white" style={{ borderColor: brand.gray300 }}>
                  <div className="text-sm" style={{ color: brand.gray500 }}>Ticket tecnici aperti</div>
                  <div className="text-2xl font-semibold">5</div>
                  <div className="text-xs" style={{ color: brand.gray500 }}>2 ad alta priorità</div>
                </div>
              </div>
            )}

            {activeTab === "staff" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: brand.gray300 }}>
                  <div>
                    <div className="font-medium">Crew Palco — Sabato</div>
                    <div className="text-sm" style={{ color: brand.gray500 }}>Richieste 8 · Pianificate 6</div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">Gap</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: brand.gray300 }}>
                  <div>
                    <div className="font-medium">Tecnici Luci — Venerdì</div>
                    <div className="text-sm" style={{ color: brand.gray500 }}>Richieste 4 · Pianificate 4</div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">OK</Badge>
                </div>
              </div>
            )}

            {activeTab === "incident" && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl border" style={{ borderColor: brand.gray300 }}>
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Accessi foyer — coda prolungata
                  </div>
                  <div className="text-sm" style={{ color: brand.gray500 }}>
                    Segnalato: ieri 20:11 · Tempo risoluzione: 23 m
                  </div>
                  <div className="mt-2 text-sm">
                    Check-list: aprire varco 2 · segnaletica mobile · push info 60’ prima
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat AI & Azioni */}
        <Card className="shadow-sm" style={{ borderColor: brand.gray300 }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chiedi alla dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Es. Mostrami gli eventi a rischio e proponi azioni (CM/Meta/Teams)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Drawer>
              <DrawerTrigger asChild>
                <Button className="w-full" disabled>
                  <Send className="w-4 h-4 mr-2" />
                  Invia domanda (demo)
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Risposta (mock)</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-3 text-sm" style={{ color: brand.gray700 }}>
                  <p>
                    <b>Diagnosi:</b> ‘Teatro — Classici d’Autunno’ sotto soglia a T-3. <SourcePill label="Eventim" />
                  </p>
                  <p>
                    <b>Cause probabili:</b> calo CTR DEM, creatività poco performante. <SourcePill label="GA4" />{" "}
                    <SourcePill label="Campaign Monitor" />
                  </p>
                  <div>
                    <div className="font-medium mb-1">Azioni suggerite</div>
                    <ul className="list-disc pl-5">
                      <li>Bozza DEM recovery in Campaign Monitor (segmento teatro) (demo)</li>
                      <li>Promo last-minute 48h su Meta Ads (budget micro) (demo)</li>
                      <li>Apri alert Teams al Responsabile Comunicazione (demo)</li>
                    </ul>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
            <div className="text-xs" style={{ color: brand.gray500 }}>
              In produzione: RAG su SharePoint/Teams + query su DB/GA4; azioni Make/n8n.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 text-center text-sm" style={{ color: brand.gray500 }}>
        Anteprima statica con logo ufficiale, filtri genere/venue e fonti dati per sezione. In produzione: binding ai dataset reali.
      </div>
    </div>
  );
}

// Export di default per compatibilità con `import App from './App'`
export default function App() {
  return <ExecutiveControlTowerPreview />;
}
