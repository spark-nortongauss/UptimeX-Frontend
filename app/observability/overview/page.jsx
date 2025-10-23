"use client"

import AuthGuard from '@/components/AuthGuard'
import HeroSection from '@/components/dashboard/HeroSection'
import AlertSeverityCards from '@/components/dashboard/AlertSeverityCards'
import GeographicMapPanel from '@/components/dashboard/GeographicMapPanel'
import ActiveAlarmsTable from '@/components/dashboard/ActiveAlarmsTable'
import SectionHeader from '@/components/dashboard/SectionHeader'
import SystemHealthCards from '@/components/dashboard/SystemHealthCards'
import TemperatureChart from '@/components/dashboard/TemperatureChart'
import NetworkConnectivityCharts from '@/components/dashboard/NetworkConnectivityCharts'
import RFMetrics from '@/components/dashboard/RFMetrics'
import OpticalCharts from '@/components/dashboard/OpticalCharts'

export default function ObservabilityOverviewPage() {
  return (
    <AuthGuard>
      <div className="space-y-8">
        {/* 1. HERO SECTION */}
        <HeroSection />

        {/* 2. ALERT SEVERITY CARDS */}
        <AlertSeverityCards />

        {/* 3. GEOGRAPHIC MAP PANEL */}
        <GeographicMapPanel />

        {/* 4. ACTIVE ALARMS TABLE */}
        <ActiveAlarmsTable />
      </div>
    </AuthGuard>
  )
}
