export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getFullName(
  firstName: string,
  lastName: string,
  middleName?: string,
  suffix?: string
): string {
  return [firstName, middleName, lastName, suffix].filter(Boolean).join(' ');
}

export function formatRole(role: string): string {
  const map: Record<string, string> = {
    RESIDENT: 'City Resident',
    BARANGAY_OFFICIAL: 'Barangay Official',
    GOVERNMENT_EMPLOYEE: "Gov't Employee",
    SUPER_ADMIN: 'Admin',
  };
  return map[role] ?? role;
}

export function formatRoleTagalog(role: string): string {
  const map: Record<string, string> = {
    RESIDENT: 'RESIDENT',
    BARANGAY_OFFICIAL: 'BARANGAY OFFICIAL',
    GOVERNMENT_EMPLOYEE: 'GOV. EMPLOYEE',
    SUPER_ADMIN: 'ADMIN',
  };
  return map[role] ?? role;
}

export function formatGender(gender: string): string {
  const map: Record<string, string> = { MALE: 'Male', FEMALE: 'Female' };
  return map[gender] ?? gender;
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING_VERIFICATION: 'Pending',
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    DEACTIVATED: 'Deactivated',
  };
  return map[status] ?? status;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}
