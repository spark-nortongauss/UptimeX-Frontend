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
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">SELECT THE SYSTEM</h1>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter the system name or ID"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full max-w-md px-4 py-3 text-base sm:text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[10%]">
                      System ID
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[10%]">
                      System Name
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[10%]">
                      Current Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[8%]">
                      SLA
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[8%]">
                      System Type
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[8%]">
                      # of Sectors
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[8%]">
                      # of MUs
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[8%]">
                      # of RUs
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[15%]">
                      System Location
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-[8%]">
                      Created At
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                      Updated At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSystems.map((system, index) => (
                    <tr key={system.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                        <div className="truncate">{system.id}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="truncate">{system.name}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <StatusBadge status={system.status} />
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="truncate">{system.sla}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="truncate">{system.type}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="truncate">{system.sectors}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="truncate">{system.mus}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="truncate">{system.rus}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="truncate" title={system.location}>{system.location}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                        <div className="truncate">{system.createdAt}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                        <div className="truncate">{system.updatedAt}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View for very small screens */}
          <div className="block sm:hidden mt-4">
            <div className="space-y-3">
              {filteredSystems.map((system) => (
                <div key={system.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{system.id}</h3>
                      <p className="text-xs text-gray-600 truncate">{system.name}</p>
                    </div>
                    <div className="ml-2 shrink-0">
                      <StatusBadge status={system.status} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">SLA:</span>
                      <p className="font-medium truncate">{system.sla}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium truncate">{system.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Sectors:</span>
                      <p className="font-medium">{system.sectors}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">MUs:</span>
                      <p className="font-medium">{system.mus}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">RUs:</span>
                      <p className="font-medium">{system.rus}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <p className="font-medium text-xs">{system.createdAt}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 truncate">Location: {system.location}</p>
                    <p className="text-xs text-gray-500">Updated: {system.updatedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
