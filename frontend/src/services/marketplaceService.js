import api from './api';   // your axios instance
import logger from '../utils/logger'; // optional: wrap console

/**
 * Fetch all companies for marketplace listing.
 * @returns {Promise<{id: number, name: string, bio: string}[]>}
 */
export async function fetchCompanies() {
  try {
    const resp = await api.get('/marketplace/companies');
    return resp.data.companies;
  } catch (err) {
    logger.error('marketplaceService › fetchCompanies failed:', err);
    // You can map API errors to user-friendly messages here
    throw err;
  }
}

/**
 * Fetch all candidates for marketplace listing.
 * @returns {Promise<{id: number, full_name: string, bio: string}[]>}
 */
export async function fetchCandidates() {
  try {
    const resp = await api.get('/marketplace/candidates');
    return resp.data.candidates;
  } catch (err) {
    logger.error('marketplaceService › fetchCandidates failed:', err);
    throw err;
  }
}

/**
 * Fetch all jobs for marketplace listing.
 * @returns {Promise<{id: number, title: string, location: string, employment_type: string, remote: boolean, posted_at: string, company_name: string}[]>}
 */
export async function fetchJobs() {
  try {
    const resp = await api.get('/marketplace/jobs');
    return resp.data.jobs;
  } catch (err) {
    logger.error('marketplaceService › fetchJobs failed:', err);
    throw err;
  }
}
