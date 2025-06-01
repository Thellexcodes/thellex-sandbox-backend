export interface CreateSubAccountRequest {
  email: string;
}

export interface SubAccountData {
  id: string;
  sn: string;
  email: string;
  reference: string;
  first_name: string;
  last_name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export type CreateSubAccountResponse = ApiResponse<SubAccountData>;
