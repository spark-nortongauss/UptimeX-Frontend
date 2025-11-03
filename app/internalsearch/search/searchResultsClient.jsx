"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { sitePages } from './page'

export default function SearchResultsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const q = searchParams?.get('q') || ''

  useEffect(() => {
    setSearchQuery(q)
  }, [q])

  const filteredPages = useMemo(() => {
    if (!q || q.trim() === '') return []
    const query = q.toLowerCase().trim()
    return sitePages.filter(page => {
      const titleMatch = page.title.toLowerCase().includes(query)
      const categoryMatch = page.category.toLowerCase().includes(query)
      const descriptionMatch = page.description.toLowerCase().includes(query)
      const urlMatch = page.url.toLowerCase().includes(query)
      return titleMatch || categoryMatch || descriptionMatch || urlMatch
    })
  }, [q])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/internalsearch/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {q ? `Searching for: "${q}"` : "Enter a search term to find pages"}
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(e) }}
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>

        <div className="max-w-4xl">
          {!q || q.trim() === '' ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Enter a search term to find pages</p>
              <p className="text-gray-500 text-sm mt-2">Search by page name, category, or description</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No results found</p>
              <p className="text-gray-500 text-sm mt-2">No pages found matching "{q}". Try adjusting your search terms.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">Found {filteredPages.length} result{filteredPages.length !== 1 ? 's' : ''}</div>
              {filteredPages.map((page, index) => (
                <Link
                  key={`${page.url}-${index}`}
                  href={page.url}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{page.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{page.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{page.category}</span>
                        <span className="font-mono">{page.url}</span>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


