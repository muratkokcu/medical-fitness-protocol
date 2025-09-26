// Simplified client data interface
export interface ClientData {
  clientId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  company?: string;
}


// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ClientResponse {
  success: boolean;
  data: {
    client: Client;
  };
  message?: string;
}

export interface Client {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  company?: string;
  organization: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes: string;
  };
  createdBy: string | {
    _id: string;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface PaginationData {
  pages: number;
  page: number;
  limit: number;
  total: number;
}

export interface ClientsResponse {
  success: boolean;
  data: {
    clients: Client[];
    pagination: PaginationData;
  };
}

export interface StatsData {
  totalClients: number;
}

export interface ClientStatsResponse {
  success: boolean;
  data: {
    stats: StatsData;
    recentClients: Client[];
  };
}