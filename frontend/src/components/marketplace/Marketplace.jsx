import React, { useEffect, useState } from 'react';
import { fetchCompanies, fetchCandidates } from '../../services/marketplaceService';

const ITEMS_PER_PAGE = 12;

export default function Marketplace() {
  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [view, setView] = useState('companies');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({}); // e.g., { location: [], industry: [] }

  useEffect(() => {
    async function load() {
      try {
        const [cs, cds] = await Promise.all([
          fetchCompanies(),
          fetchCandidates(),
        ]);
        setCompanies(cs);
        setCandidates(cds);
      } catch (err) {
        setError('Unable to load marketplace data.');
      }
    }
    load();
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;

  // Determine and filter items
  const allItems = view === 'companies' ? companies : candidates;
  const filteredItems = allItems
    .filter(item => {
      const name = view === 'companies' ? item.name : item.full_name;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    // TODO: apply additional filters here
  ;
  const pageCount = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewChange = (e) => {
    setView(e.target.value);
    setCurrentPage(1);
    setSearchTerm('');
    setFilters({});
  };

  const handleSelect = (item) => {
    console.log('Selected item:', item);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey]?.includes(value)
        ? prev[filterKey].filter(v => v !== value)
        : [...(prev[filterKey] || []), value]
    }));
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex space-x-6">
      {/* Sidebar Filters */}
      <aside className="w-1/4 border rounded p-4 space-y-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        {/* Example filter: Location */}
        <div>
          <h4 className="font-medium">Location</h4>
          {['Remote', 'Onsite', 'Hybrid'].map(loc => (
            <label key={loc} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.location?.includes(loc) || false}
                onChange={() => handleFilterChange('location', loc)}
              />
              <span>{loc}</span>
            </label>
          ))}
        </div>
        {/* Add more filter groups here */}
      </aside>

      <div className="w-3/4 space-y-6">
        {/* Header & Controls */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {view === 'companies' ? 'Companies' : 'Candidates'}
          </h2>
          <select
            value={view}
            onChange={handleViewChange}
            className="border rounded p-2"
          >
            <option value="companies">Companies</option>
            <option value="candidates">Candidates</option>
          </select>
        </div>

        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Grid of Items */}
        <div className="grid grid-cols-3 gap-4">
          {pageItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="border rounded-lg shadow-sm p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg mb-2">
                {view === 'companies' ? item.name : item.full_name}
              </h3>
              <p className="text-sm flex-1 overflow-hidden">
                {item.bio}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => goToPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(pageCount)].map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-500 text-white' : ''}`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => goToPage(Math.min(currentPage + 1, pageCount))}
            disabled={currentPage === pageCount}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
