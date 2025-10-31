"use client"

import AuthGuard from '@/components/AuthGuard'
import SectionHeader from '@/components/dashboard/SectionHeader'
import SystemHealthCards from '@/components/dashboard/SystemHealthCards'
import TemperatureChart from '@/components/dashboard/TemperatureChart'
import NetworkConnectivityCharts from '@/components/dashboard/NetworkConnectivityCharts'
import RFMetrics from '@/components/dashboard/RFMetrics'
import OpticalCharts from '@/components/dashboard/OpticalCharts'

export default function DetailedSystemPage({ params }) {
  const { id } = params || {}

  return (
    <AuthGuard>
      <div className="space-y-8">
        {/* 5. DETAILED SYSTEM STATUS HEADER */}
        <SectionHeader title="DETAILED SYSTEM" subtitle="STATUS" />

        {/* 6. SYSTEM HEALTH CARDS */}
        <SystemHealthCards />

        {/* 7. TEMPERATURE MONITORING CHART */}
        <TemperatureChart />

        {/* 8. WAN LINK STATUS HEADER */}
        <SectionHeader title="WAN LINK" subtitle="STATUS" />

        {/* 9. NETWORK CONNECTIVITY CHARTS */}
        <NetworkConnectivityCharts />

        {/* 10. RF STATUS HEADER */}
        <SectionHeader title="SYSTEM RF" subtitle="STATUS" />

        {/* 11. RF POWER METRICS */}
        <RFMetrics />

        {/* 12. OPTICAL STATUS HEADER */}
        <SectionHeader title="SYSTEM OPTICAL" subtitle="STATUS" />

        {/* 13. OPTICAL SIGNAL CHARTS */}
        <OpticalCharts />
      </div>
    </AuthGuard>
  )
}