// API Types and Interfaces

// Common types
export interface BaseContaminant {
  id?: string;
  name: string;
  removalRate: string;
  healthRisk: string;
}

// Admin API Types
export interface AdminRequestBody {
  admin?: string | null;
  password?: string | null;
  contaminants?: Array<{
    name: string;
    removalRate: string;
    healthRisk: string;
  }>;
  contaminant?: BaseContaminant;
  id?: string;
}

export interface AdminAuthResponse {
  message: string;
  token?: string;
  status: number;
}

export interface ContaminantResponse {
  message: string;
  data?: any;
  count?: number;
}

// Report API Types
export interface PATRIOTS_CONTAMINANTS_TYPE {
  id: string;
  name: string;
  removalRate: string;
  healthRisk: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportRequestBody {
  pws_id: string;
  email?: string;
  zipCode: string;
}

export interface ContaminantData {
  name: string;
  category: string;
  cas: string;
  unit: string;
  type: string;
  sub_type: string;
  median: number | null;
  average: number | null;
  detection_rate: string;
  reduced_data_quality: boolean;
  sources: string;
  health_effects: string;
  aesthetic_effects: string;
  description: string;
  body_effects: string[];
  slr: number | null;
  fed_mcl: number | null;
  fed_mclg: number | null;
  max: number | null;
}

export interface ProcessedContaminant extends ContaminantData {
  isDetected: boolean;
  currentLevel: number;
  healthGuideline: number;
  exceedanceRatio: number;
  priority: number;
  patriotData: {
    removalRate: string;
    healthRisk: string;
  };
}

export interface EmailResult {
  email: string | null;
  source: "provided" | "existing" | "none";
  isValid: boolean;
}

export interface StructuredReportData {
  zip_code: string;
  water_system_name: string;
  pws_id: string;
  detected_patriots_count: number;
  generated_at: string;
  contaminants: Array<{
    name: string;
    health_risk: string;
    local_level: string;
    health_guideline: string;
    legal_limit: string;
    removal_rate: string;
    detection_rate: string;
    is_detected: boolean;
    exceedance_ratio: number;
    category: string;
  }>;
}

export interface ReportResponse {
  results: any;
  data: ContaminantData[];
  prioritizedContaminants: ProcessedContaminant[];
  detectedPatriotsCount: number;
  pws_id: string;
  generated_at: string;
  email_captured: boolean;
  requires_email_capture: boolean;
  email_source: "provided" | "existing" | "none";
  email_valid: boolean;
  can_send_immediate_email: boolean;
  email_status_message: string;
}

// Klaviyo Event Types
export interface KlaviyoEventPayload {
  data: {
    type: "event";
    attributes: {
      properties: {
        zip_code: string;
        water_system_name: string;
        pws_id: string;
        detected_patriots_count: number;
        generated_at: string;
        contaminants: any[];
        has_lead: boolean;
        has_arsenic: boolean;
        has_pfas: boolean;
        high_priority_count: number;
        report_summary: string;
        email_deliverable: boolean;
        delivery_method: string;
        email_source: "provided" | "existing" | "none";
        email_provided_in_request: boolean;
        email_found_in_database: boolean;
      };
      metric: {
        data: {
          type: "metric";
          attributes: {
            name: string;
          };
        };
      };
      profile: {
        data: {
          type: "profile";
          attributes: {
            email?: string;
            external_id?: string;
          };
        };
      };
      time: Date;
      unique_id: string;
    };
  };
}

// Database Types
export interface ContaminantMappingData {
  pws_id: string;
  zip_code: string;
  water_system_name: string;
  email: string;
  detected_patriots_count: number;
  report_data: any[];
  klaviyo_event_sent: boolean;
}

// Route Parameter Types
export interface ContaminantRouteParams {
  params: {
    id: string;
  };
}

export interface ContaminantUpdateData {
  name: string;
  removalRate: string;
  healthRisk: string;
}

// Error Types
export interface ApiError {
  error: string;
  details?: string;
  status?: number;
}

// Utility Types
export type ContaminantCreateInput = Omit<BaseContaminant, "id">;
export type ContaminantUpdateInput = Partial<ContaminantCreateInput>;

// Form Types (extending existing form schema)
export interface ExtendedFormSubmission {
  email: string;
  phoneNumber?: string;
  zip: string;
  pwsid?: string;
}
