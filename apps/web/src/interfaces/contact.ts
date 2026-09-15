export type ContactStatus = "new" | "in_progress" | "closed";

export interface ContactSubmissionItem {
  id: string;
  /** "contact" | "custom_order" */
  type: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  message: string;
  status: ContactStatus;
  createdAt: string | Date;
}

export interface ContactFilters {
  q: string;
  status: string;
  type: string;
}

export interface ContactCounts {
  all: number;
  new: number;
  in_progress: number;
  closed: number;
}
