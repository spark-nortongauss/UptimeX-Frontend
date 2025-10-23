"use client"

import { useState } from 'react'
import AuthGuard from '@/components/AuthGuard'

// Sample data matching the screenshot
const systemsData = [
  {
    id: "NGDAS0001",
    name: "NY Airport",
    status: "Normal",
    sla: "Priority A+",
    type: "DAS",
    sectors: "6",
    mus: "6",
    rus: "130",
    location: "1st New York Ave. Airport",
    createdAt: "2021-05-12",
    updatedAt: "2024-12-18"
  },
  {
    id: "NGDAS0002",
    name: "NY Airport",
    status: "Critical",
    sla: "Priority A+",
    type: "DAS",
    sectors: "6",
    mus: "6",
    rus: "130",
    location: "1st New York Ave. Airport",
    createdAt: "2021-05-12",
    updatedAt: "2024-12-18"
  },
  {
    id: "NGDAS0003",
    name: "NY Airport",
    status: "Major",
    sla: "Priority A+",
    type: "DAS",
    sectors: "6",
    mus: "6",
    rus: "130",
    location: "1st New York Ave. Airport",
    createdAt: "2021-05-12",
    updatedAt: "2024-12-18"
  },
  {
    id: "NGDAS0004",
    name: "NY Airport",
    status: "Minor",
    sla: "Priority A+",
    type: "DAS",
    sectors: "6",
    mus: "6",
    rus: "130",
    location: "1st New York Ave. Airport",
    createdAt: "2021-05-12",
    updatedAt: "2024-12-18"
  },
  {
    id: "NGDAS0005",
    name: "NY Airport",
    status: "Information",
    sla: "Priority A+",
    type: "DAS",
    sectors: "6",
    mus: "6",
    rus: "130",
    location: "1st New York Ave. Airport",
    createdAt: "2021-05-12",
    updatedAt: "2024-12-18"
  }
]

// Status badge component with color coding
const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-500 text-white'
      case 'Critical':
        return 'bg-red-500 text-white'
      case 'Major':
        return 'bg-orange-500 text-white'
      case 'Minor':
        return 'bg-blue-500 text-white'
      case 'Information':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(status)}`}>
      {status}
    </span>
  )
}

export default function DetailedPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSystems, setFilteredSystems] = useState(systemsData)

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    
    if (term === '') {
      setFilteredSystems(systemsData)
    } else {
      const filtered = systemsData.filter(system => 
        system.id.toLowerCase().includes(term.toLowerCase()) ||
        system.name.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredSystems(filtered)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SELECT THE SYSTEM</h1>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter the system name or ID"
                value={searchTerm}
                onChange={handleSearch}
                className="w-1/2 px-4 py-3 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      System ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      System Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Current Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      SLA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      System Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      # of Sectors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      # of MUs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      # of RUs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      System Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSystems.map((system, index) => (
                    <tr key={system.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                        {system.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {system.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        <StatusBadge status={system.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {system.sla}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {system.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {system.sectors}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {system.mus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {system.rus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {system.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                        {system.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {system.updatedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
