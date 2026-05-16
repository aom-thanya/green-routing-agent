
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Map,
  Menu,
  Package,
  Route,
  ShieldAlert,
  Sparkles,
  Truck,
  Warehouse,
  X,
} from "lucide-react";

const API_BASE_URL = "https://green-route-optimization.onrender.com";
const API_TIMEOUT_MS = 5000;

const zoneDirectory = {
  Central: [
    { dcspCode: "SHK2", dcspName: "Huai Khwang 2" },
    { dcspCode: "SPDP", dcspName: "Pridi Phanomyong" },
    { dcspCode: "SPYR", dcspName: "Phayathai road" },
    { dcspCode: "SRM1", dcspName: "Rama 1" },
  ],
  East: [
    { dcspCode: "SKKG", dcspName: "Kingkarw" },
    { dcspCode: "SLKB", dcspName: "Lat Krabang" },
    { dcspCode: "SPTN", dcspName: "Pattanakarn" },
    { dcspCode: "SSTI", dcspName: "Serithai" },
  ],
  North: [
    { dcspCode: "SJKB", dcspName: "Chorakhe Bua" },
    { dcspCode: "SJTK", dcspName: "JATUJAK" },
    { dcspCode: "SPPO", dcspName: "Phlabphla-Ladpraow" },
  ],
  West: [
    { dcspCode: "SARU", dcspName: "Arunamarin" },
    { dcspCode: "SBPD", dcspName: "Bang Phlat" },
    { dcspCode: "SBPI", dcspName: "Bang Phai" },
    { dcspCode: "SEKC", dcspName: "Ekkachai" },
    { dcspCode: "SNGY", dcspName: "Nongyai" },
    { dcspCode: "SPS1", dcspName: "Phutthamonthon sai 1" },
  ],
};

const branchOptions = Object.entries(zoneDirectory).flatMap(([zone, branches]) =>
  branches.map((branch) => ({
    zone,
    dcspCode: branch.dcspCode,
    dcspName: branch.dcspName,
    value: `${zone}|${branch.dcspCode}`,
    label: `${zone} > ${branch.dcspCode} > ${branch.dcspName}`,
  }))
);

const defaultRoutePlan = {
  zone_summary: {
    zone_name: "Central SHK2 Huai Khwang 2",
    total_parcels: 2185,
    total_vehicles_needed: 13,
  },
  routes: [
    {
      truck_id: "SHK2-T01-05",
      load_percentage: "95%",
      total_distance_km: 6.04,
      estimated_completion_time: "11:30",
      stops_sequence: [
        { stop_number: "KE000035", stop_name: "Fortune Town", priority: "1 - SHOP", action: "PICKUP" },
        { stop_number: "KE000001", stop_name: "ASOK", priority: "1 - SHOP", action: "PICKUP" },
        { stop_number: "KE000206", stop_name: "Terminal21 Asok", priority: "1 - SHOP", action: "PICKUP" },
        { stop_number: "KE000205", stop_name: "Thong Lor", priority: "1 - SHOP", action: "PICKUP" },
      ],
    },
    {
      truck_id: "SHK2-T12-14",
      load_percentage: "78%",
      total_distance_km: 14.12,
      estimated_completion_time: "17:15",
      stops_sequence: [
        { stop_number: "RTSP000967", stop_name: "ท็อปส์เดลี่ เดอะ เรสซิเดนท์ ทองหล่อ", priority: "3 - RTSP", action: "PICKUP" },
        { stop_number: "RTSP002414", stop_name: "โกเฟรช-ซอยเอกมัย 30", priority: "3 - RTSP", action: "PICKUP" },
      ],
    },
    {
      truck_id: "SHK2-T15-18",
      load_percentage: "70%",
      total_distance_km: 59.93,
      estimated_completion_time: "18:30",
      stops_sequence: [
        { stop_number: "RTSP002116", stop_name: "P3612ลอว์สัน เพลินจิตเซ็นเตอร์", priority: "3 - RTSP", action: "PICKUP" },
        { stop_number: "RTSP000143", stop_name: "BigC Food Place มหาทุน", priority: "3 - RTSP", action: "PICKUP" },
        { stop_number: "SHK2", stop_name: "Huai Khwang 2 DCSP HUB", priority: "N/A", action: "RETURN TO HUB" },
      ],
    },
  ],
};

const spdpRoutePlan = {
  zone_summary: {
    zone_name: "Central SPDP Pridi Phanomyong",
    total_parcels: 1193,
    total_vehicles_needed: 10,
  },
  routes: [
    { truck_id: "SPDP-T01", load_percentage: "57%", total_distance_km: 1.55, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "KE000016", stop_name: "BTS Onnut", priority: "1 - SHOP", action: "PICKUP" }] },
    { truck_id: "SPDP-T02", load_percentage: "100%", total_distance_km: 2.27, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "KE000072", stop_name: "PTT Rama 4", priority: "1 - SHOP", action: "PICKUP" }] },
    { truck_id: "SPDP-T03", load_percentage: "51%", total_distance_km: 1.07, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "KE000020", stop_name: "BTS Thong Lo", priority: "1 - SHOP", action: "PICKUP" }] },
    { truck_id: "SPDP-T04", load_percentage: "26%", total_distance_km: 4.02, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "KE000231", stop_name: "Pridi Banomyong 27", priority: "1 - SHOP", action: "PICKUP" }, { stop_number: "RTSP002400", stop_name: "โกเฟรช-ซอยภูมิจิตร", priority: "3 - RTSP", action: "PICKUP" }] },
    { truck_id: "SPDP-T05", load_percentage: "25%", total_distance_km: 1.35, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "RTSP001574", stop_name: "อินทนิล สุขุมวิท 48", priority: "3 - RTSP", action: "PICKUP" }, { stop_number: "RTSP000964", stop_name: "ท็อปส์เดลี่ ตลาดแสงทิพย์", priority: "3 - RTSP", action: "PICKUP" }] },
    { truck_id: "SPDP-T06", load_percentage: "28%", total_distance_km: 0.75, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "RTSP001635", stop_name: "อินทนิล โครงการ ซัมเมอร์ พ้อยท์", priority: "3 - RTSP", action: "PICKUP" }] },
    { truck_id: "SPDP-T07", load_percentage: "7%", total_distance_km: 1.85, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "RTSP000140", stop_name: "Big C BMK บีเจซี 1 (Food Place)", priority: "3 - RTSP", action: "PICKUP" }, { stop_number: "RTSP004928", stop_name: "มินิบิ๊กซี บิ๊กซีสำนักงานใหญ่ กรุงเทพมหานคร", priority: "3 - RTSP", action: "PICKUP" }] },
    { truck_id: "SPDP-T08", load_percentage: "28%", total_distance_km: 2.35, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "RTSP002188", stop_name: "ลอว์สัน ออริจิน ทองหล่อ", priority: "3 - RTSP", action: "PICKUP" }] },
    { truck_id: "SPDP-T09", load_percentage: "8%", total_distance_km: 2.53, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "RTSP003141", stop_name: "โลตัส โกเฟรช -ปรีดี พนมยงศ์ 14", priority: "3 - RTSP", action: "PICKUP" }] },
    { truck_id: "SPDP-T10", load_percentage: "14%", total_distance_km: 3.56, estimated_completion_time: "N/A", stops_sequence: [{ stop_number: "RTSP004323", stop_name: "โกเฟรช -คลองตัน", priority: "3 - RTSP", action: "PICKUP" }] },
  ],
};

const spyrRoutePlan = {
  zone_summary: {
    zone_name: "Central SPYR Phayathai road",
    total_parcels: 8186,
    total_vehicles_needed: 51,
  },
  routes: [
    { truck_id: "SPYR-T02", load_percentage: "57%", estimated_completion_time: "08:22", total_distance_km: 1.21, stops_sequence: [{ stop_number: "KE000021", stop_name: "BTS Victory Monument", priority: "1 - SHOP", action: "PICKUP" }, { stop_number: "KE000021", stop_name: "BTS Victory Monument", priority: "1 - SHOP", action: "PICKUP" }] },
    { truck_id: "SPYR-T03", load_percentage: "91%", estimated_completion_time: "08:44", total_distance_km: 2.28, stops_sequence: [{ stop_number: "KE000149", stop_name: "Ratchaprarop1(Pratu Nam)", priority: "1 - SHOP", action: "PICKUP" }] },
    { truck_id: "SPYR-T04", load_percentage: "79%", estimated_completion_time: "09:06", total_distance_km: 2.35, stops_sequence: [{ stop_number: "KE000022", stop_name: "Baiyoke 1", priority: "1 - SHOP", action: "PICKUP" }] },
    { truck_id: "SPYR-T05", load_percentage: "65%", estimated_completion_time: "09:28", total_distance_km: 2.58, stops_sequence: [{ stop_number: "KE000080", stop_name: "Pratu Nam", priority: "1 - SHOP", action: "PICKUP" }] },
    { truck_id: "SPYR-T07", load_percentage: "69%", estimated_completion_time: "10:12", total_distance_km: 2.69, stops_sequence: [{ stop_number: "KE000196", stop_name: "Shibuya", priority: "1 - SHOP", action: "PICKUP" }] },
    { truck_id: "SPYR-T19", load_percentage: "52%", estimated_completion_time: "13:08", total_distance_km: 4.59, stops_sequence: [{ stop_number: "KE000045", stop_name: "MBK Center", priority: "1 - SHOP", action: "PICKUP" }] },
    { truck_id: "SPYR-T36", load_percentage: "41%", estimated_completion_time: "16:48", total_distance_km: 24.49, stops_sequence: [{ stop_number: "PSP000099", stop_name: "MIXSHOP", priority: "2 - PSP", action: "PICKUP" }] },
    { truck_id: "SPYR-T54", load_percentage: "29%", estimated_completion_time: "21:56", total_distance_km: 43.42, stops_sequence: [{ stop_number: "RTSP001262", stop_name: "ท็อปส์เดลี่ ตลาดศรีวานิช", priority: "3 - RTSP", action: "PICKUP" }] },
    { truck_id: "SPYR-T55", load_percentage: "12%", estimated_completion_time: "22:18", total_distance_km: 44.63, stops_sequence: [{ stop_number: "RTSP002193", stop_name: "ลอว์สัน เอ็กซ์ที พญาไท", priority: "3 - RTSP", action: "PICKUP" }] },
    { truck_id: "SPYR-T67", load_percentage: "12%", estimated_completion_time: "02:42", total_distance_km: 63.85, stops_sequence: [{ stop_number: "RTSP001581", stop_name: "อินทนิล กรมส่งเสริมสหกรณ์", priority: "3 - RTSP", action: "PICKUP" }] },
  ],
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getLoadValue(route) {
  if (typeof route?.load_percentage === "number") return route.load_percentage;
  return Number(String(route?.load_percentage ?? "0").replace("%", "")) || 0;
}

function formatLoad(route) {
  return `${getLoadValue(route)}%`;
}

function setRouteLoad(route, loadValue) {
  return {
    ...route,
    load_percentage: `${Math.max(0, Math.min(Math.round(loadValue), 100))}%`,
  };
}

function getOptimizationCandidates(routes, sourceTruckId) {
  const sourceRoute = routes.find((route) => route.truck_id === sourceTruckId);
  const sourceDistance = Number(sourceRoute?.total_distance_km || 0);

  return routes
    .filter((route) => {
      if (route.truck_id === sourceTruckId) return false;
      const distanceGap = Math.abs(Number(route.total_distance_km || 0) - sourceDistance);
      return getLoadValue(route) < 70 && distanceGap <= 10;
    })
    .sort((a, b) => a.total_distance_km - b.total_distance_km);
}

function buildOptimizationPreview(sourceRoute, targetRoute) {
  const sourceStops = sourceRoute?.stops_sequence?.length || 0;
  const movedStops = Math.max(1, Math.ceil(sourceStops * 0.35));
  const sourceLoadAfter = Math.max(getLoadValue(sourceRoute) - movedStops * 4, 5);
  const targetLoadAfter = Math.min(getLoadValue(targetRoute) + movedStops * 4, 100);
  const sourceDistanceAfter = Math.max(Number(sourceRoute.total_distance_km || 0) - movedStops * 0.8, 0.5);
  const targetDistanceAfter = Number(targetRoute.total_distance_km || 0) + movedStops * 0.8;
  return { movedStops, sourceLoadAfter, targetLoadAfter, sourceDistanceAfter, targetDistanceAfter };
}

function applyRouteOptimization(routePlan, sourceTruckId, targetTruckId) {
  const routes = routePlan.routes || [];
  const sourceRoute = routes.find((route) => route.truck_id === sourceTruckId);
  const targetRoute = routes.find((route) => route.truck_id === targetTruckId);
  if (!sourceRoute || !targetRoute || !sourceRoute.stops_sequence?.length) return routePlan;

  const preview = buildOptimizationPreview(sourceRoute, targetRoute);
  const movedStops = sourceRoute.stops_sequence.slice(-preview.movedStops);
  const remainingStops = sourceRoute.stops_sequence.slice(0, Math.max(sourceRoute.stops_sequence.length - preview.movedStops, 1));

  return {
    ...routePlan,
    routes: routes.map((route) => {
      if (route.truck_id === sourceTruckId) {
        return setRouteLoad(
          {
            ...route,
            total_distance_km: Number(preview.sourceDistanceAfter.toFixed(2)),
            stops_sequence: remainingStops,
            estimated_completion_time: generateEstimatedETA({ ...route, total_distance_km: preview.sourceDistanceAfter, stops_sequence: remainingStops }, 0),
          },
          preview.sourceLoadAfter
        );
      }

      if (route.truck_id === targetTruckId) {
        const updatedStops = [...(route.stops_sequence || []), ...movedStops];
        return setRouteLoad(
          {
            ...route,
            total_distance_km: Number(preview.targetDistanceAfter.toFixed(2)),
            stops_sequence: updatedStops,
            estimated_completion_time: generateEstimatedETA({ ...route, total_distance_km: preview.targetDistanceAfter, stops_sequence: updatedStops }, 1),
          },
          preview.targetLoadAfter
        );
      }

      return route;
    }),
  };
}

function getRisk(route) {
  const load = getLoadValue(route);
  if ((route?.total_distance_km ?? 0) > 40 && load < 75) return "High Risk";
  if (load < 80) return "Needs Review";
  return "Healthy";
}

function generateEstimatedETA(route, routeIndex = 0) {
  const stopCount = route?.stops_sequence?.length || 0;
  const distance = Number(route?.total_distance_km || 0);
  const totalMinutes = routeIndex * 18 + stopCount * 8 + distance * 2;
  const start = new Date();
  start.setHours(9, 0, 0, 0);
  const eta = new Date(start.getTime() + totalMinutes * 60000);
  return eta.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function ensureRouteETAs(routePlan) {
  return {
    ...routePlan,
    routes: routePlan.routes.map((route, index) => ({
      ...route,
      estimated_completion_time:
        route.estimated_completion_time && route.estimated_completion_time !== "N/A"
          ? route.estimated_completion_time
          : generateEstimatedETA(route, index),
    })),
  };
}

function normalizeRoutePlan(data, fallbackZoneName) {
  if (!data || typeof data !== "object") return null;
  if (!data.zone_summary || !Array.isArray(data.routes)) return null;

  return {
    zone_summary: {
      zone_name: data.zone_summary.zone_name || fallbackZoneName || defaultRoutePlan.zone_summary.zone_name,
      total_parcels: Number(data.zone_summary.total_parcels) || 0,
      total_vehicles_needed: Number(data.zone_summary.total_vehicles_needed) || Math.max(data.routes.length, 1),
    },
    routes: data.routes.map((route, routeIndex) => ({
      truck_id: route.truck_id || `TRUCK-${routeIndex + 1}`,
      load_percentage: route.load_percentage ?? 0,
      total_distance_km: Number(route.total_distance_km) || 0,
      estimated_completion_time:
        route.estimated_completion_time && route.estimated_completion_time !== "N/A"
          ? route.estimated_completion_time
          : generateEstimatedETA(route, routeIndex),
      stops_sequence: Array.isArray(route.stops_sequence) ? route.stops_sequence : [],
    })),
  };
}

const statusStyle = {
  "High Risk": { badge: "bg-red-50 text-red-700 border-red-200", bar: "bg-red-500", icon: ShieldAlert },
  "Needs Review": { badge: "bg-orange-50 text-orange-700 border-orange-200", bar: "bg-[#F37021]", icon: AlertTriangle },
  Healthy: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", icon: CheckCircle2 },
};

const priorityStyles = {
  "1 - SHOP": "bg-purple-50 text-purple-700 border-purple-200",
  "2 - PSP": "bg-blue-50 text-blue-700 border-blue-200",
  "3 - RTSP": "bg-slate-100 text-slate-700 border-slate-200",
  "N/A": "bg-zinc-100 text-zinc-600 border-zinc-200",
};

function StatCard({ label, value, sublabel, icon: Icon, accent = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,27,45,0.06)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
        <div className={cn("rounded-xl p-2", accent ? "bg-orange-50 text-[#F37021]" : "bg-slate-100 text-slate-600")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{sublabel}</div>
    </div>
  );
}

function RouteCard({ route, routes, onClick, onApplyOptimization }) {
  const status = getRisk(route);
  const style = statusStyle[status];
  const Icon = style.icon;
  const stopCount = route.stops_sequence?.length || 0;
  const candidates = getOptimizationCandidates(routes, route.truck_id);
  const [selectedTargetTruckId, setSelectedTargetTruckId] = useState(candidates[0]?.truck_id || "");
  const selectedTargetRoute = candidates.find((candidate) => candidate.truck_id === selectedTargetTruckId) || candidates[0];
  const preview = selectedTargetRoute ? buildOptimizationPreview(route, selectedTargetRoute) : null;

  useEffect(() => {
    setSelectedTargetTruckId(candidates[0]?.truck_id || "");
  }, [route.truck_id, candidates.map((candidate) => candidate.truck_id).join("|")]);

  return (
    <div className={cn("w-full rounded-2xl border bg-white p-4 text-left shadow-[0_8px_24px_rgba(15,27,45,0.05)]", status === "High Risk" ? "border-red-200" : "border-slate-200")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-slate-950">
            <Truck className="h-5 w-5 text-[#F37021]" />
            <span className="font-bold">{route.truck_id}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">{stopCount} sequenced stops</div>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", style.badge)}>
          <Icon className="h-3.5 w-3.5" />
          {status}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-500">Load utilization</span>
          <span className="font-bold text-slate-950">{formatLoad(route)}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className={cn("h-full rounded-full", style.bar)} style={{ width: `${Math.min(getLoadValue(route), 100)}%` }} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <MiniValue label="Distance" value={`${route.total_distance_km} km`} />
        <MiniValue label="ETA" value={route.estimated_completion_time} />
        <MiniValue label="Stops" value={stopCount} />
      </div>

      {status !== "Healthy" && (
        <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50/70 p-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#C65A1E]">
            <Sparkles className="h-3.5 w-3.5" /> AI Suggested Fleet
          </div>

          {selectedTargetRoute && preview ? (
            <>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div className="rounded-xl border border-orange-100 bg-white p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">Current Fleet</div>
                  <div className="mt-1 text-sm font-bold text-slate-950">{route.truck_id}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatLoad(route)} load · {route.total_distance_km} km · {stopCount} stops</div>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-white p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">AI Suggested Fleet</div>
                  <div className="mt-1 text-sm font-bold text-slate-950">Move {preview.movedStops} stop{preview.movedStops === 1 ? "" : "s"}</div>
                  <div className="mt-1 text-xs text-slate-500">To {selectedTargetRoute.truck_id} · {formatLoad(selectedTargetRoute)} load · {selectedTargetRoute.total_distance_km} km</div>
                </div>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <select value={selectedTargetTruckId} onChange={(event) => setSelectedTargetTruckId(event.target.value)} className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#F37021]">
                  {candidates.map((candidate) => (
                    <option key={candidate.truck_id} value={candidate.truck_id}>
                      {candidate.truck_id} · {formatLoad(candidate)} · {candidate.total_distance_km} km
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => onApplyOptimization(route.truck_id, selectedTargetRoute.truck_id)} className="rounded-xl bg-[#F37021] px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#C65A1E]">
                  Apply Optimization
                </button>
              </div>

              <div className="mt-2 text-[11px] font-medium text-slate-500">
                After apply: {route.truck_id} → {Math.round(preview.sourceLoadAfter)}% load, {selectedTargetRoute.truck_id} → {Math.round(preview.targetLoadAfter)}% load
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-500">
              No nearby underutilized truck found with load utilization below 70% and distance gap under 10 km.
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={() => onClick(route)} className="mt-4 flex w-full items-center justify-between rounded-xl px-1 py-1 text-xs font-medium text-slate-500 hover:text-[#F37021]">
        <span>Open route detail</span>
        <ChevronRight className="h-4 w-4 text-[#F37021]" />
      </button>
    </div>
  );
}

function MiniValue({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-bold text-slate-950">{value}</div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-bold text-slate-950">{value}</div>
    </div>
  );
}

function RouteDrawer({ route, onClose }) {
  if (!route) return null;

  const status = getRisk(route);
  const style = statusStyle[status];
  const stops = route.stops_sequence || [];

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 240 }} onClick={(event) => event.stopPropagation()} className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#F37021]">Route Detail</div>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">{route.truck_id}</h2>
            </div>
            <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-950">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MiniMetric label="Load" value={formatLoad(route)} />
            <MiniMetric label="Distance" value={`${route.total_distance_km} km`} />
            <MiniMetric label="ETA" value={route.estimated_completion_time} />
            <MiniMetric label="Stops" value={stops.length} />
          </div>

          <div className={cn("mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold", style.badge)}>{status}</div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center gap-2 font-bold text-slate-950">
              <Map className="h-5 w-5 text-[#F37021]" />
              Map Preview
            </div>
            <div className="relative h-52 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                <path d="M48 170 C125 60, 190 175, 265 96 S390 38, 450 145" fill="none" stroke="#F37021" strokeWidth="4" strokeDasharray="8 8" />
              </svg>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2 font-bold text-slate-950">
              <Route className="h-5 w-5 text-[#F37021]" />
              Stop Timeline
            </div>
            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={`${route.truck_id}-${stop.stop_number}-${index}`} className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F37021] text-[10px] font-bold text-white">{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-950">{stop.stop_name}</div>
                      <div className="mt-1 text-xs text-slate-500">Stop ID: {stop.stop_number}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", priorityStyles[stop.priority] || priorityStyles["N/A"])}>{stop.priority || "N/A"}</span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#C65A1E]">
                          {stop.action === "PICKUP" ? <Package className="h-3.5 w-3.5" /> : <Warehouse className="h-3.5 w-3.5" />}
                          {stop.action || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function ZoneSelector({ selectedZone, selectedDcspCode, onBranchChange }) {
  const selectedValue = `${selectedZone}|${selectedDcspCode}`;

  return (
    <div className="flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex shrink-0 items-center gap-2 pr-2 text-sm font-bold text-slate-700">
        <Map className="h-4 w-4 text-[#F37021]" />
        Branch Context
      </div>
      <select value={selectedValue} onChange={(event) => onBranchChange(event.target.value)} className="h-10 min-w-[420px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#F37021]">
        {branchOptions.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </div>
  );
}

function SkeletonBlock({ className }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200/80", className)} />;
}

function DashboardSkeleton({ selectedZone, selectedDcspCode, selectedDcspName }) {
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#F37021]">Fleet Operations Dashboard</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{selectedZone} / {selectedDcspCode} {selectedDcspName}</h1>
          <p className="mt-2 text-slate-500">Loading live branch route plan...</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /> Loading branch data
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,27,45,0.06)]">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-5 h-9 w-24" />
            <SkeletonBlock className="mt-3 h-4 w-36" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,27,45,0.05)]">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="mt-5 h-3 w-full" />
            <div className="mt-5 grid grid-cols-3 gap-2">
              <SkeletonBlock className="h-16" />
              <SkeletonBlock className="h-16" />
              <SkeletonBlock className="h-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FleetDashboard({ onRouteClick, selectedZone, selectedDcspCode, selectedDcspName, isLoading, routePlan, onApplyOptimization }) {
  if (isLoading) {
    return <DashboardSkeleton selectedZone={selectedZone} selectedDcspCode={selectedDcspCode} selectedDcspName={selectedDcspName} />;
  }

  const { zone_summary, routes } = routePlan;
  const safeRoutes = routes.length ? routes : defaultRoutePlan.routes;
  const totalVehiclesNeeded = zone_summary.total_vehicles_needed || Math.max(safeRoutes.length, 1);
  const avgParcelPerTruck = (zone_summary.total_parcels || 0) / totalVehiclesNeeded;
  const avgLoad = safeRoutes.reduce((sum, route) => sum + getLoadValue(route), 0) / safeRoutes.length;
  const highRiskCount = safeRoutes.filter((route) => getRisk(route) === "High Risk").length;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#F37021]">Fleet Operations Dashboard</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{selectedZone} / {selectedDcspCode} {selectedDcspName}</h1>
          <p className="mt-2 text-slate-500">Operational route monitoring for parcel load, productivity, and dispatch risk.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live planning data
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Parcels" value={(zone_summary.total_parcels || 0).toLocaleString()} sublabel="Assigned in zone" icon={Package} accent />
        <StatCard label="Active Trucks" value={totalVehiclesNeeded} sublabel="Vehicles needed" icon={Truck} />
        <StatCard label="Avg Parcel / Truck" value={avgParcelPerTruck.toFixed(1)} sublabel="Productivity ratio" icon={BarChart3} accent />
        <StatCard label="Avg Load Utilization" value={`${avgLoad.toFixed(0)}%`} sublabel="Across active routes" icon={Activity} />
        <StatCard label="High Risk Routes" value={highRiskCount} sublabel="Requires dispatch review" icon={ShieldAlert} accent />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Route Fleet</h2>
          <span className="text-sm text-slate-500">Risk rules applied automatically</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {safeRoutes.map((route) => (
            <RouteCard key={route.truck_id} route={route} routes={safeRoutes} onClick={onRouteClick} onApplyOptimization={onApplyOptimization} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ view, setView }) {
  const nav = useMemo(() => [{ id: "dashboard", label: "Fleet Dashboard", thai: "แดชบอร์ดรถขนส่ง", icon: Activity }], []);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => setCurrentTime(new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "medium" }).format(new Date()));
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-[#0F1B2D] text-white shadow-2xl">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F37021] shadow-lg shadow-orange-950/30">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold leading-tight">Kerry Branch</div>
            <div className="text-xs text-slate-300">Fleet Operations Center</div>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Operations</div>
        <div className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => setView(item.id)} className={cn("flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition", active ? "bg-[#8B4A24] text-white shadow-lg shadow-black/20 ring-1 ring-[#F37021]/40" : "text-slate-300 hover:bg-white/8 hover:text-white")}>
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", active ? "bg-[#F37021] text-white" : "bg-white/8 text-slate-300")}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block text-xs text-current/70">{item.thai}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-5">
        <div className="rounded-2xl bg-white/8 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            <Clock className="h-3.5 w-3.5 text-[#F37021]" /> Current Time
          </div>
          <div className="mt-1 text-sm font-bold text-white">{currentTime}</div>
        </div>
      </div>
    </aside>
  );
}

function Header({ selectedZone, selectedDcspCode, onBranchChange }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex h-20 items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm xl:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center px-6">
          <ZoneSelector selectedZone={selectedZone} selectedDcspCode={selectedDcspCode} onBranchChange={onBranchChange} />
        </div>

        <div className="flex items-center gap-3">
          <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-4">
            <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm hover:bg-slate-50">
              <Bell className="h-5 w-5" />
            </button>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-950">Ops Manager</div>
              <div className="text-xs text-slate-500">Bangkok Branch</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">OM</div>
          </div>
        </div>
      </div>
    </header>
  );
}

async function fetchRoutePlanWithFallback(dcspName, fallbackZoneName, fallbackPlan = defaultRoutePlan) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}/ask-zone/${encodeURIComponent(dcspName)}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return { plan: fallbackPlan, status: "failed" };
    const data = await response.json();
    const normalized = normalizeRoutePlan(data, fallbackZoneName);
    if (!normalized) return { plan: fallbackPlan, status: "failed" };
    return { plan: normalized, status: "live" };
  } catch {
    return { plan: fallbackPlan, status: "failed" };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedZone, setSelectedZone] = useState("Central");
  const [selectedDcspCode, setSelectedDcspCode] = useState("SHK2");
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [routePlan, setRoutePlan] = useState(defaultRoutePlan);

  const handleApplyOptimization = (sourceTruckId, targetTruckId) => {
    setRoutePlan((currentPlan) => applyRouteOptimization(currentPlan, sourceTruckId, targetTruckId));
  };

  const selectedDcsp = useMemo(() => {
    return zoneDirectory[selectedZone].find((item) => item.dcspCode === selectedDcspCode) || zoneDirectory[selectedZone][0];
  }, [selectedZone, selectedDcspCode]);

  const getLocalRoutePlan = (dcspCode) => {
    if (dcspCode === "SPDP") return ensureRouteETAs(spdpRoutePlan);
    if (dcspCode === "SPYR") return ensureRouteETAs(spyrRoutePlan);
    return null;
  };

  const loadRoutePlan = async (dcspName, zoneName, dcspCode) => {
    setIsBranchLoading(true);

    const localPlan = getLocalRoutePlan(dcspCode);
    if (localPlan) {
      window.setTimeout(() => {
        setRoutePlan(localPlan);
        setIsBranchLoading(false);
      }, 450);
      return;
    }

    const result = await fetchRoutePlanWithFallback(dcspName, zoneName, defaultRoutePlan);
    setRoutePlan(ensureRouteETAs(result.plan));
    setIsBranchLoading(false);
  };

  useEffect(() => {
    const zoneName = `${selectedZone} ${selectedDcspCode} ${selectedDcsp.dcspName}`;
    loadRoutePlan(selectedDcsp.dcspName, zoneName, selectedDcspCode);
  }, []);

  const handleBranchChange = (value) => {
    const [zone, dcspCode] = value.split("|");
    const dcsp = zoneDirectory[zone].find((item) => item.dcspCode === dcspCode) || zoneDirectory[zone][0];
    const zoneName = `${zone} ${dcspCode} ${dcsp.dcspName}`;
    setSelectedZone(zone);
    setSelectedDcspCode(dcspCode);
    setSelectedRoute(null);
    loadRoutePlan(dcsp.dcspName, zoneName, dcspCode);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7] text-slate-900">
      <Sidebar view={view} setView={setView} />
      <div className="ml-72 min-h-screen">
        <Header selectedZone={selectedZone} selectedDcspCode={selectedDcspCode} onBranchChange={handleBranchChange} />
        <main className="mx-auto max-w-[1540px] px-10 py-8">
          <FleetDashboard
            onRouteClick={setSelectedRoute}
            selectedZone={selectedZone}
            selectedDcspCode={selectedDcspCode}
            selectedDcspName={selectedDcsp.dcspName}
            isLoading={isBranchLoading}
            routePlan={routePlan}
            onApplyOptimization={handleApplyOptimization}
          />
        </main>
      </div>
      <RouteDrawer route={selectedRoute} onClose={() => setSelectedRoute(null)} />
    </div>
  );
}
