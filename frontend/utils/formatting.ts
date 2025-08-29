


import { TenderStatus, ClientStatus, UserStatus, FinancialRequestStatus, AssignmentStatus } from '../types';

/**
 * Formats a number into the Indian currency format (e.g., ₹1,50,00,000).
 * @param {number} value The number to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

/**
 * Formats large numbers into the Indian numbering system (Lakhs, Crores).
 * @param {number} value The number to format.
 * @returns {string} The formatted string (e.g., ₹1.50 Cr, ₹25.00 L).
 */
export const formatLargeIndianNumber = (value: number): string => {
    if (value >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`;
    }
    if (value >= 100000) {
        return `₹${(value / 100000).toFixed(2)} L`;
    }
    return formatCurrency(value);
};

/**
 * Provides consistent CSS classes for Tender Status badges.
 * @param {TenderStatus} status The tender status.
 * @returns {string} The CSS classes for the badge.
 */
export const getTenderStatusBadgeClass = (status: TenderStatus): string => {
  const baseClass = "px-3 py-1 text-sm font-medium rounded-full inline-block ring-1 ring-inset";
  switch (status) {
    case TenderStatus.Won: return `${baseClass} bg-green-500/10 text-green-400 ring-green-500/20`;
    case TenderStatus.Lost: return `${baseClass} bg-red-500/10 text-red-400 ring-red-500/20`;
    case TenderStatus.Dropped: return `${baseClass} bg-orange-500/10 text-orange-400 ring-orange-500/20`;
    case TenderStatus.Submitted: return `${baseClass} bg-cyan-500/10 text-cyan-400 ring-cyan-500/20`;
    case TenderStatus.UnderReview: return `${baseClass} bg-yellow-500/10 text-yellow-400 ring-yellow-500/20`;
    case TenderStatus.Drafting: return `${baseClass} bg-gray-500/10 text-gray-400 ring-gray-500/20`;
    default: return `${baseClass} bg-gray-500/10 text-gray-400 ring-gray-500/20`;
  }
};

/**
 * Provides consistent CSS classes for Client Status badges.
 * @param {ClientStatus} status The client status.
 * @returns {string} The CSS classes for the badge.
 */
export const getClientStatusBadgeClass = (status: ClientStatus): string => {
    const base = "px-3 py-1 text-sm font-medium rounded-full ring-1 ring-inset";
    switch (status) {
        case ClientStatus.Active: return `${base} bg-green-500/10 text-green-400 ring-green-500/20`;
        case ClientStatus.Lead: return `${base} bg-sky-500/10 text-sky-400 ring-sky-500/20`;
        case ClientStatus.Dormant: return `${base} bg-yellow-500/10 text-yellow-400 ring-yellow-500/20`;
        case ClientStatus.Lost: return `${base} bg-red-500/10 text-red-400 ring-red-500/20`;
        default: return `${base} bg-gray-500/10 text-gray-400 ring-gray-500/20`;
    }
};

/**
 * Provides consistent CSS classes for User Status badges.
 * @param {UserStatus} status The user status.
 * @returns {string} The CSS classes for the badge.
 */
export const getUserStatusBadgeClass = (status: UserStatus): string => {
    const base = "px-3 py-1 text-sm font-medium rounded-full ring-1 ring-inset";
    switch (status) {
        case 'Active': return `${base} bg-green-500/10 text-green-400 ring-green-500/20`;
        case 'Inactive': return `${base} bg-gray-500/10 text-gray-400 ring-gray-500/20`;
        default: return `${base} bg-gray-500/10 text-gray-400 ring-gray-500/20`;
    }
};

/**
 * Provides consistent CSS classes for Financial Request Status badges.
 * @param {FinancialRequestStatus} status The financial request status.
 * @returns {string} The CSS classes for the badge.
 */
export const getFinancialRequestStatusBadgeClass = (status: FinancialRequestStatus): string => {
  const baseClass = "px-3 py-1 text-sm font-semibold rounded-full ring-1 ring-inset";
  const lowerCaseStatus = status.toLowerCase();
  if (lowerCaseStatus.includes('approved') || lowerCaseStatus.includes('processed') || lowerCaseStatus.includes('refunded') || lowerCaseStatus.includes('released')) return `${baseClass} bg-green-500/10 text-green-400 ring-green-500/20`;
  if (lowerCaseStatus.includes('declined') || lowerCaseStatus.includes('forfeited') || lowerCaseStatus.includes('expired')) return `${baseClass} bg-red-500/10 text-red-400 ring-red-500/20`;
  if (lowerCaseStatus.includes('pending')) return `${baseClass} bg-yellow-500/10 text-yellow-400 ring-yellow-500/20`;
  return `${baseClass} bg-gray-500/10 text-gray-400 ring-gray-500/20`;
};

/**
 * Provides consistent CSS classes for Assignment Status badges.
 * @param {AssignmentStatus} status The assignment status.
 * @returns {string} The CSS classes for the badge.
 */
export const getAssignmentStatusBadgeClass = (status: AssignmentStatus): string => {
  const baseClass = "px-3 py-1 text-sm font-medium rounded-full inline-block ring-1 ring-inset";
  switch (status) {
    case AssignmentStatus.Accepted: return `${baseClass} bg-green-500/10 text-green-400 ring-green-500/20`;
    case AssignmentStatus.Declined: return `${baseClass} bg-red-500/10 text-red-400 ring-red-500/20`;
    case AssignmentStatus.Pending:
    default: return `${baseClass} bg-yellow-500/10 text-yellow-400 ring-yellow-500/20`;
  }
};

/**
 * Converts a Date object or UTC string to a format suitable for datetime-local input.
 * @param {string | Date} date The date to convert.
 * @returns {string} The formatted string in 'YYYY-MM-DDTHH:mm' format.
 */
export const toDatetimeLocal = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    // getTimezoneOffset returns the difference in minutes between UTC and local time.
    // It's positive if the local timezone is behind UTC and negative if it's ahead.
    const tzOffset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (tzOffset * 60000));
    
    // .toISOString() returns UTC time, but our localDate is now adjusted to local.
    // We want the 'YYYY-MM-DDTHH:mm' part.
    return localDate.toISOString().slice(0, 16);
};

/**
 * Formats a date string into a relative time string (e.g., "5 minutes ago").
 * @param {string} dateString The ISO date string.
 * @returns {string} The relative time string.
 */
export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return `Yesterday`;
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/**
 * Opens a URL in a new tab, converting data URLs to blob URLs to avoid browser restrictions.
 * @param {string} url The URL to open (can be http, blob, or data URL).
 */
export const openUrlInNewTab = (url: string): void => {
  if (!url.startsWith('data:')) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  try {
    const [header, base64Data] = url.split(',');
    const mimeTypeMatch = header.match(/:(.*?);/);
    if (!mimeTypeMatch || !base64Data) {
        console.error('Invalid data URL format', url);
        return;
    }
    const mimeType = mimeTypeMatch[1];

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    // The browser will revoke the object URL when the document/tab is closed.
  } catch (error) {
      console.error("Error opening data URL:", error);
  }
};
