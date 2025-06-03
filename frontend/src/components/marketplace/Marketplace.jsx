import React, { useEffect, useState, useContext } from 'react';
import { fetchCompanies, fetchCandidates, fetchJobs } from '../../services/marketplaceService';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import './Marketplace.css';

const ITEMS_PER_PAGE = 12;

export default function Marketplace() {
  const { user } = useContext(UserContext);
  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [view, setView] = useState(
    user?.role === 'client' ? 'candidates' : user?.role === 'candidate' ? 'jobs' : 'companies'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({}); // e.g., { location: [], industry: [] }

  useEffect(() => {
    async function load() {
      try {
        const [cs, cds, js] = await Promise.all([
          fetchCompanies(),
          fetchCandidates(),
          fetchJobs(),
        ]);
        setCompanies(cs);
        setCandidates(cds);
        setJobs(js);
      } catch (err) {
        setError('Unable to load marketplace data.');
      }
    }
    load();
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;

  // Determine and filter items
  let allItems;
  if (view === 'companies') {
    allItems = companies;
  } else if (view === 'candidates') {
    allItems = candidates;
  } else {
    allItems = jobs;
  }

  const filteredItems = allItems
    .filter(item => {
      let name;
      if (view === 'companies') {
        name = item.name;
      } else if (view === 'candidates') {
        name = item.full_name;
      } else {
        name = item.title;
      }
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
    <div className="marketplace-container">
      {/* Sidebar Filters */}
      <aside className="marketplace-sidebar">
        <h3>Filters</h3>
        {/* Example filter: Location */}
        <div>
          <h4>Location</h4>
          {['Remote', 'Onsite', 'Hybrid'].map(loc => (
            <label key={loc}>
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

      <div className="marketplace-main">
        {/* Header & Controls */}
        <div className="marketplace-header">
          <h2>
            {view === 'companies' ? 'Companies' : view === 'candidates' ? 'Candidates' : 'Jobs'}
          </h2>
          <select
            value={view}
            onChange={handleViewChange}
            className="marketplace-select"
          >
            <option value="companies">Companies</option>
            <option value="candidates">Candidates</option>
            <option value="jobs">Jobs</option>
          </select>
        </div>

        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="marketplace-search"
          />
        </div>

        {/* Grid of Items */}
        <div className="marketplace-grid">
          {pageItems.map(item => (
            <Link
              key={item.id}
              to={view === 'companies' ? `/client/${item.id}/public` : view === 'candidates' ? `/candidate/${item.id}/full/public` : `/jobs/${item.id}`}
              className="marketplace-item"
            >
              <h3>{view === 'companies' ? item.name : view === 'candidates' ? item.full_name : item.title}</h3>
              <p>
                {view === 'companies' ? item.bio : view === 'candidates' ? item.bio : `${item.location || 'Unknown location'} - ${item.employment_type || 'N/A'} - ${item.company_name || ''}`}
              </p>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="marketplace-pagination">
          <button
            onClick={() => goToPage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(pageCount)].map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => goToPage(Math.min(currentPage + 1, pageCount))}
            disabled={currentPage === pageCount}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
