export type Organization = {
  id: string
  name: string
  slug: string
  plan_code: string | null
  country_code: string
  currency_code: string
  created_at: string
}

export type Owner = {
  id: string
  organization_id: string
  email: string
  full_name: string | null
  company_name: string | null
  support_email: string | null
  support_whatsapp: string | null
  organization?: Organization | null
  created_at: string
}

export type Property = {
  id: string
  organization_id: string
  owner_id: string
  property_name: string
  address: string
  unit_number: string | null
  occupancy_status?: 'occupied' | 'pre_vacant' | 'vacant' | 'relisting_in_progress'
  expected_vacancy_date?: string | null
  vacancy_marked_at?: string | null
  availability_notes?: string | null
  created_at: string
}

export type Tenant = {
  id: string
  organization_id: string
  owner_id: string
  property_id: string
  broker_id?: string | null
  full_name: string
  email: string | null
  phone: string | null
  tenant_access_id: string
  lease_start_date: string | null
  lease_end_date: string | null
  monthly_rent: number
  payment_due_day: number
  payment_status: 'pending' | 'paid' | 'overdue' | 'partial'
  status: 'active' | 'inactive' | 'terminated'
  organization?: Organization | null
  brokers?: {
    id: string
    full_name: string
    email: string
    phone: string | null
    agency_name: string | null
    is_active: boolean
  } | null
  created_at: string
}

export type Broker = {
  id: string
  organization_id: string
  owner_id: string | null
  full_name: string
  email: string
  phone: string | null
  agency_name: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TenantTicket = {
  id: string
  organization_id: string
  tenant_id: string
  owner_id: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export type SupportTicketMessage = {
  id: string
  ticket_id: string
  organization_id: string
  sender_role: 'tenant' | 'owner' | 'admin' | 'system'
  sender_owner_id: string | null
  sender_tenant_id: string | null
  sender_admin_id: string | null
  message: string
  message_type: 'initial_message' | 'reply' | 'closing_note' | 'system'
  created_at: string
  sender_display_name: string
}

export type SupportTicketDetail = TenantTicket & {
  tenants?: {
    id: string
    full_name: string
    tenant_access_id: string
    email?: string | null
    properties?: {
      id: string
      property_name: string
      unit_number: string | null
    } | null
  } | null
  owners?: {
    id: string
    full_name: string | null
    company_name: string | null
    email: string
    support_email?: string | null
  } | null
  organizations?: {
    id: string
    name: string
    slug: string
  } | null
}

export type SupportTicketThread = {
  ticket: SupportTicketDetail
  messages: SupportTicketMessage[]
}

export type MaintenanceCategory =
  | 'general'
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliance'
  | 'locksmith'
  | 'pest_control'
  | 'cleaning'
  | 'painting'
  | 'carpentry'
  | 'waterproofing'
  | 'other'

export type MaintenanceUrgency = 'emergency' | 'urgent' | 'standard'

export type MaintenanceWorkflowStatus =
  | 'triaged'
  | 'quote_collection'
  | 'owner_review'
  | 'assigned'
  | 'scheduled'
  | 'in_progress'
  | 'awaiting_tenant_confirmation'
  | 'completed'
  | 'cancelled'

export type MaintenanceAssignmentStatus =
  | 'approved'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'tenant_confirmed'
  | 'cancelled'
  | 'follow_up_required'

export type ContractorDirectoryEntry = {
  id: string
  organization_id: string
  owner_id: string | null
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  is_active: boolean
  notes: string | null
  specialties: MaintenanceCategory[]
  average_rating: number | null
  completed_jobs_count: number
  created_at: string
  updated_at: string
}

export type MaintenanceQuoteRequest = {
  id: string
  organization_id: string
  maintenance_workflow_id: string
  ticket_id: string
  contractor_id: string
  request_channel: 'email' | 'whatsapp' | 'internal'
  status: 'requested' | 'responded' | 'declined' | 'expired' | 'cancelled'
  requested_at: string
  responded_at: string | null
  expires_at: string | null
  request_message: string | null
  provider_reference: string | null
  created_at: string
  updated_at: string
  contractor: ContractorDirectoryEntry | null
}

export type MaintenanceQuote = {
  id: string
  organization_id: string
  maintenance_workflow_id: string
  quote_request_id: string | null
  contractor_id: string
  amount: number
  currency_code: string
  scope_of_work: string
  availability_note: string | null
  estimated_start_at: string | null
  estimated_completion_at: string | null
  status: 'submitted' | 'withdrawn' | 'accepted' | 'rejected'
  submitted_at: string
  created_at: string
  updated_at: string
  contractor: ContractorDirectoryEntry | null
}

export type MaintenanceAssignment = {
  id: string
  organization_id: string
  maintenance_workflow_id: string
  ticket_id: string
  contractor_id: string
  quote_id: string | null
  approved_by_owner_id: string
  booking_status: MaintenanceAssignmentStatus
  appointment_start_at: string | null
  appointment_end_at: string | null
  appointment_notes: string | null
  completion_notes: string | null
  completed_at: string | null
  tenant_confirmed_at: string | null
  tenant_feedback_rating: number | null
  tenant_feedback_note: string | null
  follow_up_due_at: string | null
  follow_up_alert_sent_at: string | null
  created_at: string
  updated_at: string
  contractor: ContractorDirectoryEntry | null
  quote: MaintenanceQuote | null
}

export type MaintenanceWorkflow = {
  id: string
  ticket_id: string
  organization_id: string
  owner_id: string
  tenant_id: string
  property_id: string | null
  category: MaintenanceCategory
  urgency: MaintenanceUrgency
  workflow_status: MaintenanceWorkflowStatus
  classification_source: 'rules' | 'ai' | 'manual'
  classification_notes: string | null
  quote_requested_at: string | null
  approved_quote_id: string | null
  approved_at: string | null
  approved_by_owner_id: string | null
  follow_up_due_at: string | null
  follow_up_alert_sent_at: string | null
  created_at: string
  updated_at: string
  quote_requests: MaintenanceQuoteRequest[]
  quotes: MaintenanceQuote[]
  assignment: MaintenanceAssignment | null
  quote_comparison: {
    lowest_quote: MaintenanceQuote | null
    highest_quote: MaintenanceQuote | null
    average_amount: number | null
    quote_count: number
  }
}

export type OwnerMaintenanceWorkflowOverview = {
  ticket: SupportTicketDetail
  suggested_triage: {
    isMaintenance: boolean
    category: MaintenanceCategory
    urgency: MaintenanceUrgency
    classificationSource: 'rules'
    rationale: string
  }
  workflow: MaintenanceWorkflow | null
  contractors: ContractorDirectoryEntry[]
  relevant_contractors: ContractorDirectoryEntry[]
}

export type TenantMaintenanceWorkflowOverview = {
  ticket: SupportTicketDetail
  workflow: MaintenanceWorkflow | null
}

export type OwnerNotification = {
  id: string
  organization_id: string
  owner_id: string
  tenant_id: string | null
  notification_type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  tenants?: {
    id: string
    full_name: string
    tenant_access_id: string
  } | null
}

export type OwnerSummary = {
  active_tenants: number
  open_tickets: number
  overdue_rent: number
  reminders_pending: number
  unread_notifications: number
  awaiting_approvals: number
}

export type OwnerSubscription = {
  id: string
  owner_id: string
  organization_id?: string
  plan_code: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
}

export type OwnerAiSettings = {
  id: string
  organization_id: string
  automation_enabled: boolean
  ticket_classification_enabled: boolean
  reminder_generation_enabled: boolean
  ticket_summarization_enabled: boolean
  ai_model: string
  created_at: string
  updated_at: string
}

export type OwnerAiSettingsResponse = {
  ok: true
  ai_configured: boolean
  settings: OwnerAiSettings
}

export type OwnerAutomationSettings = {
  id: string
  organization_id: string
  owner_id: string
  compliance_alerts_enabled: boolean
  rent_chasing_enabled: boolean
  portfolio_visibility_enabled: boolean
  cash_flow_reporting_enabled: boolean
  daily_digest_enabled: boolean
  weekly_digest_enabled: boolean
  monthly_digest_enabled: boolean
  status_command_enabled: boolean
  yield_alert_threshold_percent: number | null
  yield_alert_cooldown_days: number
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  created_at: string
  updated_at: string
}

export type CashFlowReportScope = 'current' | 'monthly' | 'annual'

export type CashFlowYieldAlertItem = {
  signature: string
  kind: 'portfolio' | 'property'
  label: string
  actual_yield_percent: number
  threshold_percent: number
  property_id?: string
}

export type CashFlowPropertyMetric = {
  property_id: string
  property_name: string
  unit_number: string | null
  gross_rent_due: number
  gross_rent_received: number
  maintenance_costs: number
  service_charges: number
  agency_fees: number
  fixed_charges: number
  net_income: number
  yield_percent: number | null
  property_value: number | null
  target_yield_percent: number | null
  below_target: boolean
}

export type CashFlowPortfolioMetric = {
  report_scope: CashFlowReportScope
  report_label: string
  report_year: number
  report_month: number
  report_period_key: string
  period_start: string
  period_end: string
  currency_code: string
  property_count: number
  gross_rent_due: number
  gross_rent_received: number
  maintenance_costs: number
  service_charges: number
  agency_fees: number
  fixed_charges: number
  net_income: number
  yield_percent: number | null
  target_yield_threshold_percent: number | null
  below_target: boolean
}

export type CashFlowSnapshot = {
  id: string
  owner_id: string
  organization_id: string
  report_scope: CashFlowReportScope
  trigger_type: 'schedule' | 'event' | 'manual'
  report_label: string
  report_year: number
  report_month: number
  report_period_key: string
  period_start: string
  period_end: string
  currency_code: string
  property_count: number
  portfolio_gross_rent: number
  portfolio_maintenance: number
  portfolio_fixed_charges: number
  portfolio_net_income: number
  portfolio_yield_percent: number | null
  below_target_count: number
  alerts_sent: string[]
  payload: {
    portfolio: CashFlowPortfolioMetric
    properties: CashFlowPropertyMetric[]
    below_target_items: CashFlowYieldAlertItem[]
  }
  created_at: string
  owners?: {
    full_name?: string | null
    company_name?: string | null
    email?: string | null
  } | null
  organizations?: {
    name?: string | null
    slug?: string | null
  } | null
}

export type OwnerCashFlowOverview = {
  current_report: {
    generated_at: string
    portfolio: CashFlowPortfolioMetric
    properties: CashFlowPropertyMetric[]
    below_target_items: CashFlowYieldAlertItem[]
  }
  latest_monthly_snapshot: CashFlowSnapshot | null
  latest_annual_snapshot: CashFlowSnapshot | null
  recent_snapshots: CashFlowSnapshot[]
}

export type AdminCashFlowOverview = {
  recent_snapshots: CashFlowSnapshot[]
}

export type VacancyCampaignEvent = {
  id: string
  vacancy_campaign_id: string
  event_type:
    | 'campaign_created'
    | 'listing_draft_generated'
    | 'owner_approved'
    | 'listing_publish_attempted'
    | 'lead_recorded'
    | 'viewing_recorded'
    | 'application_recorded'
    | 'status_update_sent'
    | 'campaign_state_changed'
  title: string
  message: string
  metadata: Record<string, unknown>
  created_at: string
}

export type VacancyLead = {
  id: string
  vacancy_campaign_id: string
  property_id: string
  owner_id: string
  full_name: string
  email: string | null
  phone: string | null
  source: string
  status: 'new' | 'qualified' | 'viewing_scheduled' | 'application_submitted' | 'inactive'
  notes: string | null
  created_at: string
  updated_at: string
}

export type VacancyViewing = {
  id: string
  vacancy_campaign_id: string
  property_id: string
  owner_id: string
  lead_id: string | null
  scheduled_start_at: string
  scheduled_end_at: string | null
  booking_status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  calendar_event_id: string | null
  created_at: string
  updated_at: string
}

export type VacancyApplication = {
  id: string
  vacancy_campaign_id: string
  property_id: string
  owner_id: string
  lead_id: string | null
  applicant_name: string
  desired_move_in_date: string | null
  monthly_salary: number | null
  status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
}

export type VacancyCampaign = {
  id: string
  organization_id: string
  owner_id: string
  property_id: string
  tenant_id: string | null
  source_type: 'tenant_notice' | 'lease_expiry' | 'manual'
  campaign_status: 'owner_review' | 'approved' | 'relisting_in_progress' | 'listed' | 'leased' | 'cancelled'
  vacancy_state: 'pre_vacant' | 'vacant' | 'relisting_in_progress'
  expected_vacancy_date: string
  actual_vacancy_date: string | null
  trigger_reference: string | null
  trigger_notes: string | null
  listing_title: string | null
  listing_description: string | null
  listing_features: string[]
  availability_label: string | null
  draft_source: 'template' | 'ai'
  draft_generation_status: 'ready' | 'skipped' | 'failed'
  draft_generated_at: string | null
  owner_approved_at: string | null
  listing_sync_status: 'pending_approval' | 'not_configured' | 'queued' | 'published' | 'failed'
  listing_provider: string | null
  listing_external_id: string | null
  listing_url: string | null
  enquiry_count: number
  scheduled_viewings_count: number
  applications_count: number
  last_status_digest_at: string | null
  created_at: string
  updated_at: string
  days_until_vacancy: number
  next_action: string
  property: Property | null
  tenant: Pick<Tenant, 'id' | 'organization_id' | 'owner_id' | 'property_id' | 'full_name' | 'email' | 'phone' | 'lease_end_date' | 'monthly_rent' | 'status'> | null
  events: VacancyCampaignEvent[]
  leads: VacancyLead[]
  viewings: VacancyViewing[]
  applications: VacancyApplication[]
  owner?: {
    full_name?: string | null
    company_name?: string | null
    email?: string | null
  } | null
  organization?: {
    name?: string | null
    slug?: string | null
  } | null
}

export type OwnerVacancyOverview = {
  summary: {
    active_campaign_count: number
    pre_vacant_count: number
    vacant_count: number
    relisting_in_progress_count: number
    listed_count: number
    enquiries_count: number
    scheduled_viewings_count: number
    applications_count: number
  }
  campaigns: VacancyCampaign[]
}

export type AdminVacancyOverview = {
  summary: {
    active_campaign_count: number
    listed_count: number
    leased_count: number
    cancelled_count: number
  }
  campaigns: VacancyCampaign[]
}

export type ScreeningQuestionnaireAnswer = {
  id: string
  screening_applicant_id: string
  organization_id: string
  answer_key: string
  answer_label: string
  answer_value: string | null
  is_verified: boolean
  verification_notes: string | null
  created_at: string
  updated_at: string
}

export type ScreeningDocument = {
  id: string
  screening_applicant_id: string
  organization_id: string
  document_type: 'emirates_id' | 'salary_slip' | 'employment_letter' | 'passport' | 'visa' | 'other'
  file_name: string
  storage_path: string | null
  public_url: string | null
  mime_type: string | null
  file_size_bytes: number | null
  extraction_status: 'not_requested' | 'pending' | 'extracted' | 'failed' | 'manual'
  verification_status: 'pending' | 'submitted' | 'verified' | 'failed' | 'not_provided'
  extracted_payload: Record<string, unknown> | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ScreeningEvent = {
  id: string
  screening_applicant_id: string
  organization_id: string
  actor_role: 'owner' | 'admin' | 'system'
  actor_owner_id: string | null
  actor_admin_id: string | null
  event_type:
    | 'applicant_created'
    | 'questionnaire_updated'
    | 'document_added'
    | 'recommendation_generated'
    | 'viewing_decision_updated'
    | 'final_disposition_updated'
  title: string
  message: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export type ScreeningApplicantOverview = {
  id: string
  organization_id: string
  owner_id: string
  property_id: string | null
  vacancy_campaign_id: string | null
  vacancy_application_id: string | null
  enquiry_source: 'manual_owner' | 'manual_admin' | 'listing' | 'whatsapp' | 'vacancy_campaign' | 'webhook' | 'other'
  source_reference: string | null
  applicant_name: string
  email: string | null
  phone: string | null
  employer: string | null
  monthly_salary: number | null
  current_residence: string | null
  reason_for_moving: string | null
  number_of_occupants: number | null
  desired_move_in_date: string | null
  target_rent_amount: number | null
  identification_status: 'pending' | 'submitted' | 'verified' | 'failed' | 'not_provided'
  employment_verification_status: 'pending' | 'submitted' | 'verified' | 'failed' | 'not_provided'
  affordability_ratio: number | null
  recommendation_category: 'green' | 'amber' | 'red' | 'unscored'
  recommendation_summary: string | null
  recommendation_reasons: string[]
  recommendation_generated_at: string | null
  ai_screening_status: 'not_requested' | 'skipped' | 'generated' | 'failed'
  viewing_decision: 'pending' | 'approved' | 'rejected' | 'scheduled'
  final_disposition: 'in_review' | 'rejected' | 'viewing' | 'lease_prep' | 'withdrawn' | 'approved'
  owner_decision_notes: string | null
  created_at: string
  updated_at: string
  property: Pick<Property, 'id' | 'organization_id' | 'owner_id' | 'property_name' | 'address' | 'unit_number'> | null
  owner: {
    id?: string
    full_name: string | null
    company_name: string | null
    email: string
  } | null
  organization: {
    name: string | null
    slug: string | null
  } | null
}

export type ScreeningApplicantDetail = ScreeningApplicantOverview & {
  questionnaire_answers: ScreeningQuestionnaireAnswer[]
  documents: ScreeningDocument[]
  events: ScreeningEvent[]
}

export type OwnerScreeningOverview = {
  summary: {
    total_applicants: number
    green_count: number
    amber_count: number
    red_count: number
    unscored_count: number
    in_review_count: number
    lease_prep_count: number
  }
  applicants: ScreeningApplicantOverview[]
  total: number
  page: number
  page_size: number
}

export type AdminScreeningOverview = {
  summary: OwnerScreeningOverview['summary']
  applicants: ScreeningApplicantOverview[]
  total: number
  page: number
  page_size: number
}

export type ConditionReportRoomLabel =
  | 'bedroom'
  | 'bathroom'
  | 'kitchen'
  | 'living_area'
  | 'balcony'
  | 'ac_unit'
  | 'water_heater'
  | 'hallway'
  | 'storage'
  | 'other'

export type ConditionReportRoomEntry = {
  id: string
  condition_report_id: string
  organization_id: string
  room_label: ConditionReportRoomLabel
  room_label_display: string
  display_order: number
  condition_rating: 'not_reviewed' | 'good' | 'fair' | 'poor'
  condition_notes: string | null
  comparison_result: 'not_applicable' | 'pending_review' | 'matched' | 'changed' | 'attention_required'
  comparison_notes: string | null
  media_count: number
  created_at: string
  updated_at: string
}

export type ConditionReportMedia = {
  id: string
  condition_report_id: string
  room_entry_id: string | null
  organization_id: string
  room_label: ConditionReportRoomLabel
  media_kind: 'photo' | 'video' | 'document' | 'other'
  media_url: string | null
  storage_path: string | null
  mime_type: string | null
  caption: string | null
  captured_by_role: 'owner' | 'tenant' | 'admin' | 'system'
  ai_analysis_status: 'not_requested' | 'pending_provider' | 'analyzed' | 'failed'
  ai_analysis_payload: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type ConditionReportEvent = {
  id: string
  condition_report_id: string
  organization_id: string
  actor_role: 'owner' | 'tenant' | 'admin' | 'system'
  actor_owner_id: string | null
  actor_tenant_id: string | null
  actor_admin_id: string | null
  event_type:
    | 'report_created'
    | 'room_updated'
    | 'media_added'
    | 'comparison_refreshed'
    | 'document_refreshed'
    | 'owner_confirmed'
    | 'tenant_confirmed'
    | 'status_updated'
  title: string
  message: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export type ConditionReportOverview = {
  id: string
  organization_id: string
  owner_id: string
  property_id: string
  tenant_id: string | null
  vacancy_campaign_id: string | null
  baseline_report_id: string | null
  report_type: 'move_in' | 'move_out'
  workflow_status: 'draft' | 'collecting_evidence' | 'ready_for_confirmation' | 'confirmation_in_progress' | 'confirmed' | 'cancelled'
  trigger_source: 'tenant_created' | 'tenant_activated' | 'vacancy_campaign' | 'manual_owner' | 'manual_admin'
  trigger_reference: string | null
  report_label: string
  report_summary: string | null
  comparison_status: 'not_applicable' | 'baseline_missing' | 'pending_review' | 'matched' | 'changes_detected'
  comparison_summary: string | null
  ai_analysis_status: 'not_requested' | 'pending_provider' | 'analyzed' | 'failed'
  ai_analysis_payload: Record<string, unknown> | null
  generated_document_status: 'not_generated' | 'pending_provider' | 'generated' | 'failed'
  generated_document_format: 'pdf' | 'html' | null
  generated_document_provider: string | null
  generated_document_url: string | null
  generated_document_payload: Record<string, unknown> | null
  owner_confirmation_status: 'pending' | 'confirmed' | 'disputed'
  owner_confirmation_note: string | null
  owner_confirmed_at: string | null
  tenant_confirmation_status: 'pending' | 'confirmed' | 'disputed'
  tenant_confirmation_note: string | null
  tenant_confirmed_at: string | null
  last_summary_refreshed_at: string | null
  created_at: string
  updated_at: string
  property: Pick<Property, 'id' | 'organization_id' | 'owner_id' | 'property_name' | 'address' | 'unit_number'> | null
  tenant: Pick<Tenant, 'id' | 'organization_id' | 'owner_id' | 'property_id' | 'full_name' | 'email' | 'phone' | 'tenant_access_id' | 'lease_start_date' | 'lease_end_date' | 'status'> | null
  owner: Pick<Owner, 'id' | 'full_name' | 'company_name' | 'email'> | null
  organization: Pick<Organization, 'id' | 'name' | 'slug'> | null
  room_completion: {
    total_rooms: number
    assessed_rooms: number
    media_items: number
  }
}

export type ConditionReportDetail = ConditionReportOverview & {
  rooms: ConditionReportRoomEntry[]
  media: ConditionReportMedia[]
  events: ConditionReportEvent[]
  baseline_report: {
    id: string
    report_type: 'move_in' | 'move_out'
    report_label: string
    comparison_status: ConditionReportOverview['comparison_status']
    created_at: string
    generated_document_status: ConditionReportOverview['generated_document_status']
    generated_document_url: string | null
  } | null
}

export type OwnerConditionReportOverview = {
  summary: {
    total_reports: number
    move_in_count: number
    move_out_count: number
    awaiting_owner_confirmation_count: number
    awaiting_tenant_confirmation_count: number
    confirmed_count: number
  }
  reports: ConditionReportOverview[]
}

export type TenantConditionReportOverview = OwnerConditionReportOverview

export type AdminConditionReportOverview = {
  summary: {
    total_reports: number
    move_in_count: number
    move_out_count: number
    pending_confirmations_count: number
    generated_document_count: number
  }
  reports: ConditionReportOverview[]
  total: number
  page: number
  page_size: number
}

export type PortfolioTicketHighlight = {
  id: string
  subject: string
  status: TenantTicket['status']
  created_at: string
  updated_at: string
  tenant_name: string | null
  tenant_access_id: string | null
  property_name: string | null
  unit_number: string | null
  urgency: 'urgent' | 'normal'
  age_days: number
}

export type PortfolioVacancyHighlight = {
  property_id: string
  property_name: string
  unit_number: string | null
}

export type PortfolioOverdueItem = {
  tenant_id: string
  tenant_name: string
  tenant_access_id: string
  property_id: string
  property_name: string | null
  unit_number: string | null
  monthly_rent: number
}

export type PortfolioCashFlowSignal = {
  id: string
  report_scope: 'current' | 'monthly' | 'annual'
  report_label: string
  currency_code: string
  portfolio_net_income: number
  portfolio_yield_percent: number | null
  created_at: string
}

export type PortfolioVisibilityPayload = {
  ticket_highlights: {
    recent: PortfolioTicketHighlight[]
    urgent_open: PortfolioTicketHighlight[]
    stale_open: PortfolioTicketHighlight[]
  }
  overdue_rent_items: PortfolioOverdueItem[]
  compliance_highlights: ComplianceUpcomingItem[]
  vacancy_highlights: PortfolioVacancyHighlight[]
  cash_flow_summary: {
    latest_monthly_snapshot: PortfolioCashFlowSignal | null
    latest_annual_snapshot: PortfolioCashFlowSignal | null
  }
}

export type PortfolioVisibilitySnapshot = {
  id: string
  owner_id: string
  organization_id: string
  snapshot_scope: 'current' | 'daily' | 'weekly' | 'monthly'
  trigger_type: 'schedule' | 'event' | 'manual'
  snapshot_label: string
  period_start: string
  period_end: string
  currency_code: string
  active_tenant_count: number
  open_ticket_count: number
  new_ticket_count: number
  urgent_open_ticket_count: number
  stale_ticket_count: number
  overdue_rent_count: number
  reminders_pending_count: number
  awaiting_approvals_count: number
  occupied_property_count: number
  vacant_property_count: number
  upcoming_compliance_count: number
  payload: PortfolioVisibilityPayload
  created_at: string
  owners?: {
    full_name?: string | null
    company_name?: string | null
    email?: string | null
  } | null
  organizations?: {
    name?: string | null
    slug?: string | null
  } | null
}

export type OwnerPortfolioVisibilityOverview = {
  current_snapshot: Omit<PortfolioVisibilitySnapshot, 'id' | 'owner_id' | 'organization_id' | 'created_at'> & {
    generated_at: string
  }
  latest_daily_snapshot: PortfolioVisibilitySnapshot | null
  latest_weekly_snapshot: PortfolioVisibilitySnapshot | null
  latest_monthly_snapshot: PortfolioVisibilitySnapshot | null
  recent_snapshots: PortfolioVisibilitySnapshot[]
  recent_alerts: OwnerNotification[]
}

export type AdminPortfolioVisibilityOverview = {
  recent_snapshots: PortfolioVisibilitySnapshot[]
}

export type AutomationRun = {
  id: string
  job_id: string | null
  organization_id: string | null
  owner_id: string | null
  flow_name: string
  status: 'success' | 'failed' | 'partial' | 'skipped' | 'cancelled'
  started_at: string
  completed_at: string | null
  processed_count: number
  metadata: Record<string, unknown>
}

export type AutomationJob = {
  id: string
  organization_id: string | null
  owner_id: string | null
  job_type: string
  handler_key: string
  trigger_type: 'schedule' | 'event' | 'manual'
  dedupe_key: string
  payload: Record<string, unknown>
  run_at: string
  next_run_at: string
  lifecycle_status: 'queued' | 'running' | 'succeeded' | 'failed' | 'skipped' | 'cancelled'
  status: string
  attempts: number
  retry_count: number
  max_attempts: number
  last_error: string | null
  last_error_code: string | null
  locked_at: string | null
  started_at: string | null
  finished_at: string | null
  processed_at: string | null
  source_type: string | null
  source_ref: string | null
}

export type AutomationError = {
  id: string
  run_id: string | null
  job_id: string | null
  organization_id: string | null
  owner_id: string | null
  flow_name: string
  error_message: string
  context: Record<string, unknown>
  created_at: string
}

export type ComplianceUpcomingItem = {
  legal_date_id: string
  organization_id: string
  owner_id: string
  property_id: string
  tenant_id: string | null
  trigger_date_type: 'ejari_expiry' | 'contract_end' | 'rera_notice_date'
  trigger_label: string
  property_name: string
  unit_number: string | null
  tenant_name: string | null
  tenant_access_id: string | null
  relevant_date: string
  relevant_date_label: string
  days_remaining: number
  next_threshold: 120 | 90 | 60 | 30 | null
  last_sent_at: string | null
  last_sent_threshold: 120 | 90 | 60 | 30 | null
  next_action: string
  legal_action_initiated: boolean
  draft_title: string | null
}

export type ComplianceReminderEvent = {
  id: string
  legal_date_id: string
  organization_id: string
  owner_id: string
  property_id: string
  tenant_id: string | null
  trigger_date_type: 'ejari_expiry' | 'contract_end' | 'rera_notice_date'
  threshold_days: 120 | 90 | 60 | 30
  relevant_date: string
  days_remaining: number
  notification_type: 'compliance_alert' | 'compliance_alert_urgent'
  message_subject: string | null
  message_preview: string | null
  delivery_channels: Array<{ channel: string; status: string; reason?: string }>
  next_action: string | null
  legal_action_recommended: boolean
  legal_action_initiated: boolean
  draft_title: string | null
  draft_body: string | null
  sent_at: string
  created_at: string
  properties?: {
    property_name: string | null
    unit_number: string | null
  } | null
  tenants?: {
    full_name: string | null
    tenant_access_id: string | null
  } | null
}

export type ComplianceOverview = {
  upcoming_items: ComplianceUpcomingItem[]
  sent_reminders: ComplianceReminderEvent[]
  failures: AutomationError[]
}

export type AdminAutomationHealth = {
  pending_jobs: number
  processing_jobs: number
  failed_jobs: number
  runs_last_24h: number
  errors_last_24h: number
  queued_by_flow: Array<{
    job_type: string
    label: string
    cadence: 'daily' | 'weekly' | 'monthly' | 'event'
    phase: 'phase_1' | 'phase_2'
    pending: number
    processing: number
    failed: number
    skipped?: number
    description?: string
  }>
  registered_handlers?: number
  last_run: {
    id: string
    flow_name: string
    status: string
    completed_at: string | null
  } | null
  last_error: {
    id: string
    flow_name: string
    error_message: string
    created_at: string
  } | null
}

export type TenantSummary = {
  open_tickets: number
  pending_reminders: number
  payment_status: string
  monthly_rent: number
  payment_due_day: number
  lease_start_date: string | null
  lease_end_date: string | null
  next_due_date: string
}

export type RentPaymentApprovalStatus = 'awaiting_owner_approval' | 'approved' | 'rejected'

export type TenantRentPaymentState = {
  is_visible: boolean
  can_mark_paid: boolean
  status: RentPaymentApprovalStatus | 'eligible' | 'not_available'
  cycle_year: number
  cycle_month: number
  due_date: string
  window_starts_at: string
  amount_paid: number
  currency_code: string
  rejection_reason: string | null
  approval_id: string | null
  requested_at: string | null
  reviewed_at: string | null
}

export type TenantLeaseRenewalIntentState = {
  eligible: boolean
  lease_end_date: string | null
  days_remaining: number | null
  window_days: number
  already_responded: boolean
  current_response: 'yes' | 'no' | null
  responded_at: string | null
}

export type OwnerRentPaymentApproval = {
  id: string
  organization_id: string
  owner_id: string
  tenant_id: string
  property_id: string
  cycle_year: number
  cycle_month: number
  due_date: string
  amount_paid: number
  status: RentPaymentApprovalStatus
  rejection_reason: string | null
  reviewed_by_owner_id: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  tenants?: {
    full_name: string
    tenant_access_id: string
  } | null
  properties?: {
    property_name: string
    unit_number: string | null
  } | null
}

export type TenantOwnerContact = {
  id: string
  organization_id?: string
  full_name: string | null
  company_name: string | null
  support_email: string | null
  support_whatsapp: string | null
}

export type TelegramOnboardingState = {
  connected: boolean
  bot_username: string | null
  connect_url: string | null
  linked_chat: {
    chat_id: string
    username: string | null
    first_name: string | null
    last_name: string | null
    linked_at: string
  } | null
}

export type OwnerNotificationPreferences = {
  id: string
  organization_id: string
  owner_id: string
  ticket_created_email: boolean
  ticket_created_telegram: boolean
  ticket_reply_email: boolean
  ticket_reply_telegram: boolean
  rent_payment_awaiting_approval_email: boolean
  rent_payment_awaiting_approval_telegram: boolean
  created_at: string
  updated_at: string
}

export type OwnerTelegramDeliveryLog = {
  id: string
  event_type: string
  status: 'success' | 'failed'
  attempts: number
  recipient_chat_id: string
  error_message: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type TenantAuthPayload = {
  token: string
  tenant: {
    id: string
    full_name: string
    tenant_access_id: string
    status: string
    owner_id: string
    organization_id: string
    property_id: string
  }
}

export type OwnerAuthPayload = {
  token: string
  owner: Owner
}

export type ApiSuccess<T> = T & { ok: true }

export type ApiMessageResponse = {
  ok: true
  message: string
}

export type ContactMessageReceipt = {
  id: string
  created_at: string
}

export type PublicOperationsSnapshot = {
  open_tickets: number
  active_tenants: number
  due_this_week: number
  generated_at: string
}

export type AdminUser = {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export type AdminAuthPayload = {
  token: string
  admin: AdminUser
}

export type PaginationMeta = {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type AdminSortMeta = {
  sort_by: string
  sort_order: 'asc' | 'desc'
}

export type AdminListResponse<T> = {
  ok: true
  items: T[]
  pagination: PaginationMeta
  sort: AdminSortMeta
  search: string
}

export type AdminOwnerRow = {
  id: string
  organization_id: string
  email: string
  full_name: string | null
  company_name: string | null
  support_email: string | null
  support_whatsapp: string | null
  organizations?: {
    name: string
    slug: string
    plan_code: string | null
  } | null
  created_at: string
}

export type AdminTenantRow = {
  id: string
  organization_id: string
  owner_id: string
  property_id: string
  full_name: string
  email: string | null
  phone: string | null
  tenant_access_id: string
  monthly_rent: number
  payment_due_day: number
  payment_status: Tenant['payment_status']
  status: Tenant['status']
  created_at: string
  owners?: {
    email: string
    company_name: string | null
  } | null
  properties?: {
    property_name: string
    unit_number: string | null
  } | null
  organizations?: {
    name: string
    slug: string
    plan_code: string | null
    country_code: string
    currency_code: string
  } | null
}

export type AdminPropertyRow = {
  id: string
  organization_id: string
  owner_id: string
  property_name: string
  address: string
  unit_number: string | null
  created_at: string
  owners?: {
    email: string
    company_name: string | null
  } | null
  organizations?: {
    name: string
    slug: string
    plan_code: string | null
  } | null
}

export type AdminTicketRow = {
  id: string
  organization_id: string
  owner_id: string
  tenant_id: string
  subject: string
  message: string
  status: TenantTicket['status']
  created_at: string
  updated_at: string
  tenants?: {
    full_name: string
    tenant_access_id: string
  } | null
  owners?: {
    email: string
  } | null
  organizations?: {
    name: string
    slug: string
    plan_code: string | null
  } | null
}

export type ContactMessage = {
  id: string
  organization_id?: string | null
  name: string
  email: string
  message: string
  organizations?: {
    name: string
    slug: string
    plan_code?: string | null
  } | null
  created_at: string
}

export type AnalyticsEvent = {
  id: string
  event_name: string
  user_type: 'public' | 'owner' | 'tenant' | 'admin' | 'system'
  metadata: Record<string, unknown>
  created_at: string
}

export type AnalyticsSummary = {
  total_events: number
  by_event: Array<{ event_name: string; count: number }>
  by_user_type: Array<{ user_type: string; count: number }>
}

export type AdminAnalyticsResponse = AdminListResponse<AnalyticsEvent> & {
  summary: AnalyticsSummary
  days: number
}

export type AdminDashboardSummary = {
  total_organizations: number
  total_owners: number
  total_tenants: number
  total_properties: number
  open_tickets: number
  recent_contact_messages: ContactMessage[]
  recent_registrations: Array<{
    id: string
    user_type: 'owner' | 'tenant'
    label: string
    email: string | null
    organization_id?: string | null
    organization_name?: string | null
    created_at: string
  }>
  events_last_7_days: number
  top_events: Array<{ event_name: string; count: number }>
}

export type AdminSystemHealth = {
  status: 'ok'
  uptime_seconds: number
  node_version: string
  memory: {
    rss: number
    heap_total: number
    heap_used: number
  }
  database: {
    status: 'ok'
    latency_ms: number
  }
  generated_at: string
}

export type AdminAiStatus = {
  openai_configured: boolean
  organizations_with_ai_enabled: number
  ticket_classification_enabled_count: number
  reminder_generation_enabled_count: number
  ticket_summarization_enabled_count: number
}

export type OwnerAutomationActivityResponse = {
  ok: true
  items: AutomationRun[]
  pagination: PaginationMeta
}

export type AdminOrganizationRow = {
  id: string
  name: string
  slug: string
  plan_code: string | null
  created_at: string
  counts: {
    owners: number
    tenants: number
    properties: number
    subscriptions: number
  }
}

export type AdminOrganizationDetail = {
  organization: Organization
  owners: AdminOwnerRow[]
  tenants: AdminTenantRow[]
  properties: AdminPropertyRow[]
  tickets: AdminTicketRow[]
  subscriptions: OwnerSubscription[]
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string | null
  author: string
  published: boolean
  created_at: string
  updated_at: string
}

export type BlogListResponse = {
  ok: true
  posts: BlogPost[]
  pagination: PaginationMeta
}
