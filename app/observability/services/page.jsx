"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import AuthGuard from "@/components/AuthGuard"
import { zabbixService } from "@/lib/services/zabbixService"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Search,
} from "lucide-react"

const STATUS_ORDER = {
  Problem: 2,
  Warning: 1,
  OK: 0,
}

const STATUS_STYLES = {
  OK: "bg-green-50 text-green-700 border border-green-100",
  Warning: "bg-amber-50 text-amber-700 border border-amber-100",
  Problem: "bg-red-50 text-red-700 border border-red-100",
}

const STATUS_ICONS = {
  OK: CheckCircle2,
  Warning: AlertTriangle,
  Problem: AlertTriangle,
}

const formatTimestamp = (value) => {
  if (!value) return "—"
  const date =
    typeof value === "number"
      ? new Date(value * 1000)
      : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

const StatusBadge = ({ status }) => {
  const Icon = STATUS_ICONS[status] ?? CheckCircle2
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status] ?? STATUS_STYLES.OK,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  )
}

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    {[...Array(5)].map((_, idx) => (
      <div
        key={idx}
        className="h-10 rounded-lg bg-gray-100 dark:bg-neutral-800"
      />
    ))}
  </div>
)

export default function ServicesPage() {
  const t = useTranslations("Services")
  const [services, setServices] = useState([])
  const [summary, setSummary] = useState(null)
  const [windowInfo, setWindowInfo] = useState(null)
  const [lastUpdated, setLastUpdated] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sortKey, setSortKey] = useState("status")
  const [sortDirection, setSortDirection] = useState("desc")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const fetchServices = useCallback(
    async (options = { isRefresh: false }) => {
      if (options.isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError("")
      try {
        const response = await zabbixService.getServiceAvailability()
        const rows = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        setServices(rows)
        setSummary(response?.summary ?? null)
        setWindowInfo(response?.window ?? null)
        setLastUpdated(response?.timestamp ?? new Date().toISOString())
      } catch (err) {
        console.error("Failed to load services:", err)
        setError(err?.message ?? t("error.title"))
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [t],
  )

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch =
        !normalizedSearch ||
        svc.hostName?.toLowerCase().includes(normalizedSearch) ||
        svc.serviceName?.toLowerCase().includes(normalizedSearch)
      const matchesStatus =
        statusFilter === "ALL" ? true : svc.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [services, normalizedSearch, statusFilter])

  const sortedServices = useMemo(() => {
    const data = [...filteredServices]
    data.sort((a, b) => {
      let aVal
      let bVal

      switch (sortKey) {
        case "host":
          aVal = (a.hostName || "").toLowerCase()
          bVal = (b.hostName || "").toLowerCase()
          break
        case "service":
          aVal = (a.serviceName || "").toLowerCase()
          bVal = (b.serviceName || "").toLowerCase()
          break
        case "availability":
          aVal = a.availability ?? 0
          bVal = b.availability ?? 0
          break
        case "lastCheck":
          aVal = a.lastChangeTimestamp ?? 0
          bVal = b.lastChangeTimestamp ?? 0
          break
        case "status":
        default:
          aVal = STATUS_ORDER[a.status] ?? 0
          bVal = STATUS_ORDER[b.status] ?? 0
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
      return 0
    })
    return data
  }, [filteredServices, sortDirection, sortKey])

  const computedSummary = useMemo(() => {
    if (summary) return summary
    const fallback = {
      total: services.length,
      problem: services.filter((svc) => svc.status === "Problem").length,
      warning: services.filter((svc) => svc.status === "Warning").length,
      ok: services.filter((svc) => svc.status === "OK").length,
      averageAvailability:
        services.length === 0
          ? 0
          : Number(
              (
                services.reduce((acc, svc) => acc + (svc.availability ?? 0), 0) /
                services.length
              ).toFixed(2),
            ),
    }
    return fallback
  }, [services, summary])

  const statusFilters = [
    { value: "ALL", label: t("filters.all") },
    { value: "Problem", label: t("filters.problem") },
    { value: "Warning", label: t("filters.warning") },
    { value: "OK", label: t("filters.ok") },
  ]

  const summaryCards = [
    {
      label: t("summary.total"),
      value: computedSummary.total ?? 0,
    },
    {
      label: t("summary.problem"),
      value: computedSummary.problem ?? 0,
    },
    {
      label: t("summary.warning"),
      value: computedSummary.warning ?? 0,
    },
    {
      label: t("summary.availability"),
      value:
        computedSummary.averageAvailability !== undefined
          ? `${computedSummary.averageAvailability}%`
          : "—",
    },
  ]

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const renderSortIndicator = (key) => {
    if (sortKey !== key) return null
    return (
      <span className="ml-1 text-xs text-gray-400">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    )
  }

  const lastUpdatedLabel = lastUpdated
    ? t("updated", {
        timestamp: formatTimestamp(lastUpdated),
      })
    : null

  const windowLabel = windowInfo
    ? t("window.lastNDays", { days: windowInfo.days ?? 30 })
    : null

  return (
    <AuthGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {t("title")}
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label className="sr-only" htmlFor="services-search">
              {t("searchPlaceholder")}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="services-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-100 dark:focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase text-gray-500">
                {t("filters.label")}
              </span>
              <div className="flex gap-1 rounded-full border border-gray-200 p-1 dark:border-neutral-800">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-all",
                      statusFilter === filter.value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => fetchServices({ isRefresh: true })}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-neutral-800 dark:text-gray-200 dark:hover:border-blue-400"
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("actions.refreshing")}
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  {t("actions.refresh")}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4 dark:border-neutral-800">
            <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
              {windowLabel && <p>{windowLabel}</p>}
              {lastUpdatedLabel && <p>{lastUpdatedLabel}</p>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("summary.total")}: {filteredServices.length}
            </p>
          </div>

          {loading && !refreshing ? (
            <TableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t("error.title")}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {error}
                </p>
              </div>
              <button
                onClick={() => fetchServices()}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
              >
                {t("error.action")}
              </button>
            </div>
          ) : sortedServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <CheckCircle2 className="h-10 w-10 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t("empty.title")}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("empty.subtitle")}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] divide-y divide-gray-100 dark:divide-neutral-800">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-neutral-900 dark:text-gray-400">
                  <tr>
                    <th
                      className="px-6 py-3 text-left"
                      onClick={() => handleSort("host")}
                    >
                      <button className="flex items-center text-left">
                        {t("columns.hostName")} {renderSortIndicator("host")}
                      </button>
                    </th>
                    <th
                      className="px-6 py-3 text-left"
                      onClick={() => handleSort("service")}
                    >
                      <button className="flex items-center text-left">
                        {t("columns.serviceName")}{" "}
                        {renderSortIndicator("service")}
                      </button>
                    </th>
                    <th
                      className="px-6 py-3 text-left"
                      onClick={() => handleSort("availability")}
                    >
                      <button className="flex items-center text-left">
                        {t("columns.availability")}{" "}
                        {renderSortIndicator("availability")}
                      </button>
                    </th>
                    <th
                      className="px-6 py-3 text-left"
                      onClick={() => handleSort("status")}
                    >
                      <button className="flex items-center text-left">
                        {t("columns.status")} {renderSortIndicator("status")}
                      </button>
                    </th>
                    <th
                      className="px-6 py-3 text-left"
                      onClick={() => handleSort("lastCheck")}
                    >
                      <button className="flex items-center text-left">
                        {t("columns.lastCheck")}{" "}
                        {renderSortIndicator("lastCheck")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-sm dark:divide-neutral-800 dark:bg-neutral-900">
                  {sortedServices.map((service) => (
                    <tr
                      key={service.serviceId}
                      className="hover:bg-gray-50 dark:hover:bg-neutral-800/60"
                    >
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      
                        {service.hostId && (
                          <p className="text-xs text-gray-500">
                            ID: {service.hostId}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {service.serviceName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {service.severity}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                        <span className="font-semibold">
                          {service.availabilityPercent ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={service.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {formatTimestamp(service.lastCheck ?? service.lastChangeTimestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

