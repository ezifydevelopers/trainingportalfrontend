
export type ContactStatus = "New" | "Converted" | "Contacted" | "Following";

export interface Contact {
  id: number;
  name: string;
  email: string;
  company: string;
  status: ContactStatus;
  assignedTo: string;
  created: string;
  contactNumber?: string;
  address?: string;
  designation?: string;
  dataCategory?: string;
  contactAttempt?: string;
  resultOfEfforts?: string;
  comments?: string;
  emailBlastDate?: string;
  bulkEmailFollowup?: string;
  bulkEmailFollowupDate?: string;
  customizedEmailData?: string;
  followupOverdue?: boolean;
}

export interface Company {
  id: number;
  name: string;
  logoUrl?: string;
}
