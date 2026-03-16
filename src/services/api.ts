import type {
  AdminAnalyticsResponse,
  AdminAiStatus,
  AdminAutomationHealth,
  AdminCashFlowOverview,
  AdminPortfolioVisibilityOverview,
  AdminVacancyOverview,
  AutomationJob,
  CashFlowReportScope,
  ComplianceOverview,
  ContractorDirectoryEntry,
  AdminAuthPayload,
  AdminDashboardSummary,
  ApiMessageResponse,
  AdminListResponse,
  AdminOwnerRow,
  AdminPropertyRow,
  AdminOrganizationDetail,
  AdminOrganizationRow,
  AdminSystemHealth,
  AdminTenantRow,
  AdminTicketRow,
  BlogListResponse,
  BlogPost,
  Broker,
  ContactMessage,
  ContactMessageReceipt,
  Owner,
  OwnerAutomationActivityResponse,
  OwnerMaintenanceWorkflowOverview,
  OwnerCashFlowOverview,
  OwnerPortfolioVisibilityOverview,
  OwnerAutomationSettings,
  OwnerAuthPayload,
  OwnerAiSettingsResponse,
  OwnerNotification,
  OwnerRentPaymentApproval,
  OwnerNotificationPreferences,
  OwnerTelegramDeliveryLog,
  OwnerSummary,
  Property,
  SupportTicketThread,
  TenantMaintenanceWorkflowOverview,
  Tenant,
  TenantAuthPayload,
  TenantOwnerContact,
  TenantSummary,
  TenantRentPaymentState,
  TenantLeaseRenewalIntentState,
  TenantTicket,
  TelegramOnboardingState,
  PublicOperationsSnapshot,
  AdminScreeningOverview,
} from '../types/api'

const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? ''
const normalizedApiBaseUrl = rawApiBaseUrl.split(',')[0]?.trim().replace(/\/$/, '').replace(/\/api$/, '') ?? ''
const API_BASE_URL = normalizedApiBaseUrl || 'http://localhost:8787'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  token?: string | null
  body?: unknown
}

type ApiErrorPayload = {
  ok: false
  error: string
  details?: string | null
  issues?: Array<{
    message?: string
    path?: Array<string | number>
  }>
  requestId?: string | null
}

type ListQueryInput = {
  page?: number
  page_size?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  days?: number
  organization_id?: string
  flow_name?: string
  status?: string
  job_type?: string
  lifecycle_status?: string
}

type OwnerNotificationPreferencePatch = Partial<{
  ticket_created_email: boolean
  ticket_created_telegram: boolean
  ticket_reply_email: boolean
  ticket_reply_telegram: boolean
  rent_payment_awaiting_approval_email: boolean
  rent_payment_awaiting_approval_telegram: boolean
}>

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as T | ApiErrorPayload) : null

  if (!response.ok) {
    const payload = data as ApiErrorPayload | null
    const firstIssue = payload?.issues?.[0]?.message
    const detail = typeof payload?.details === 'string' && payload.details.length > 0 ? payload.details : null
    const message = [payload?.error || 'Request failed', firstIssue ?? detail].filter(Boolean).join(': ')
    throw new Error(message)
  }

  return data as T
}

function toQueryString(params: ListQueryInput): string {
  const searchParams = new URLSearchParams()
  if (typeof params.page === 'number') {
    searchParams.set('page', String(params.page))
  }
  if (typeof params.page_size === 'number') {
    searchParams.set('page_size', String(params.page_size))
  }
  if (params.search) {
    searchParams.set('search', params.search)
  }
  if (params.sort_by) {
    searchParams.set('sort_by', params.sort_by)
  }
  if (params.sort_order) {
    searchParams.set('sort_order', params.sort_order)
  }
  if (typeof params.days === 'number') {
    searchParams.set('days', String(params.days))
  }
  if (params.organization_id) {
    searchParams.set('organization_id', params.organization_id)
  }
  if (params.flow_name) {
    searchParams.set('flow_name', params.flow_name)
  }
  if (params.status) {
    searchParams.set('status', params.status)
  }
  if (params.job_type) {
    searchParams.set('job_type', params.job_type)
  }
  if (params.lifecycle_status) {
    searchParams.set('lifecycle_status', params.lifecycle_status)
  }

  const rendered = searchParams.toString()
  return rendered ? `?${rendered}` : ''
}

export const api = {
  getHealth: () => request<{ ok: true; env: string; service: string; ts: string }>('/api/health'),

  sendContactMessage: (body: { name: string; email: string; message: string }) =>
    request<{ ok: true; message: string; contact_message: ContactMessageReceipt }>('/api/public/contact', {
      method: 'POST',
      body,
    }),

  getPublicOperationsSnapshot: () =>
    request<{ ok: true; snapshot: PublicOperationsSnapshot }>('/api/public/operations-snapshot'),

  sendAnalyticsEvent: (body: {
    event_name: string
    user_type?: 'public' | 'owner' | 'tenant' | 'admin' | 'system'
    metadata?: Record<string, unknown>
  }) => request<{ ok: true; event: unknown }>('/api/public/analytics', { method: 'POST', body }),

  ownerRegister: (body: {
    email: string
    password: string
    full_name?: string
    company_name?: string
    support_email?: string
    support_whatsapp?: string
    country_code: string
  }) => request<OwnerAuthPayload & { ok: true }>('/api/auth/owner/register', { method: 'POST', body }),

  ownerLogin: (body: { email: string; password: string }) =>
    request<OwnerAuthPayload & { ok: true }>('/api/auth/owner/login', { method: 'POST', body }),

  ownerForgotPassword: (body: { email: string }) =>
    request<ApiMessageResponse>('/api/auth/owner/forgot-password', { method: 'POST', body }),

  ownerResetPassword: (body: { token: string; password: string }) =>
    request<ApiMessageResponse>('/api/auth/owner/reset-password', { method: 'POST', body }),

  ownerMe: (token: string) => request<{ ok: true; owner: Owner }>('/api/auth/owner/me', { token }),

  tenantLogin: (body: { tenant_access_id: string; password: string; email?: string }) =>
    request<TenantAuthPayload & { ok: true }>('/api/auth/tenant/login', { method: 'POST', body }),

  tenantForgotPassword: (body: { tenant_access_id: string; email: string }) =>
    request<ApiMessageResponse>('/api/auth/tenant/forgot-password', { method: 'POST', body }),

  tenantResetPassword: (body: { token: string; password: string }) =>
    request<ApiMessageResponse>('/api/auth/tenant/reset-password', { method: 'POST', body }),

  tenantMe: (token: string) =>
    request<{
      ok: true
      tenant: Tenant
      property: Property | null
      owner: TenantOwnerContact | null
      organization?: {
        id: string
        name: string
        slug: string
        plan_code: string | null
        country_code: string
        currency_code: string
        created_at: string
      } | null
    }>('/api/auth/tenant/me', { token }),

  adminLogin: (body: { email: string; password: string }) =>
    request<AdminAuthPayload & { ok: true }>('/api/admin/login', { method: 'POST', body }),

  adminMe: (token: string) => request<{ ok: true; admin: AdminAuthPayload['admin'] }>('/api/admin/me', { token }),

  getOwnerSummary: (token: string) => request<{ ok: true; summary: OwnerSummary }>('/api/owners/dashboard-summary', { token }),

  getOwnerRentPaymentApprovals: (token: string) =>
    request<{ ok: true; approvals: OwnerRentPaymentApproval[] }>('/api/owners/rent-payment-approvals', { token }),

  reviewOwnerRentPaymentApproval: (
    token: string,
    approvalId: string,
    body: {
      action: 'approve' | 'reject'
      rejection_reason?: string
    },
  ) =>
    request<{ ok: true; approval: OwnerRentPaymentApproval }>(`/api/owners/rent-payment-approvals/${approvalId}`, {
      method: 'PATCH',
      token,
      body,
    }),

  getOwnerAiSettings: (token: string) =>
    request<OwnerAiSettingsResponse>('/api/owner/ai-settings', { token }),

  updateOwnerAiSettings: (
    token: string,
    body: Partial<{
      automation_enabled: boolean
      ticket_classification_enabled: boolean
      reminder_generation_enabled: boolean
      ticket_summarization_enabled: boolean
      ai_model: string
    }>,
  ) =>
    request<OwnerAiSettingsResponse>('/api/owner/ai-settings', {
      method: 'PUT',
      token,
      body,
    }),

  getOwnerProperties: (token: string) => request<{ ok: true; properties: Property[] }>('/api/owners/properties', { token }),

  createOwnerProperty: (token: string, body: { property_name: string; address: string; unit_number?: string }) =>
    request<{ ok: true; property: Property }>('/api/owners/properties', { method: 'POST', token, body }),

  updateOwnerProperty: (
    token: string,
    propertyId: string,
    body: Partial<{ property_name: string; address: string; unit_number: string | null }>,
  ) => request<{ ok: true; property: Property }>(`/api/owners/properties/${propertyId}`, { method: 'PATCH', token, body }),

  deleteOwnerProperty: (token: string, propertyId: string) =>
    request<{ ok: true }>(`/api/owners/properties/${propertyId}`, { method: 'DELETE', token }),

  getOwnerTenants: (token: string) => request<{ ok: true; tenants: Tenant[] }>('/api/owners/tenants', { token }),

  createOwnerTenant: (
    token: string,
    body: {
      property_id: string
      broker_id?: string
      full_name: string
      email?: string
      phone?: string
      password: string
      lease_start_date?: string
      lease_end_date?: string
      monthly_rent: number
      payment_due_day: number
      payment_status?: Tenant['payment_status']
      status?: Tenant['status']
    },
  ) => request<{ ok: true; tenant: Tenant }>('/api/owners/tenants', { method: 'POST', token, body }),

  updateOwnerTenant: (token: string, tenantId: string, body: Record<string, unknown>) =>
    request<{ ok: true; tenant: Tenant }>(`/api/owners/tenants/${tenantId}`, { method: 'PATCH', token, body }),

  deleteOwnerTenant: (token: string, tenantId: string) =>
    request<{ ok: true }>(`/api/owners/tenants/${tenantId}`, { method: 'DELETE', token }),

  getOwnerBrokers: (token: string) =>
    request<{ ok: true; brokers: Broker[] }>('/api/owners/brokers', { token }),

  createOwnerBroker: (
    token: string,
    body: {
      full_name: string
      email: string
      phone?: string
      agency_name?: string
      notes?: string
      is_active?: boolean
    },
  ) => request<{ ok: true; broker: Broker }>('/api/owners/brokers', { method: 'POST', token, body }),

  updateOwnerBroker: (
    token: string,
    brokerId: string,
    body: Partial<{
      full_name: string
      email: string
      phone: string | null
      agency_name: string | null
      notes: string | null
      is_active: boolean
    }>,
  ) => request<{ ok: true; broker: Broker }>(`/api/owners/brokers/${brokerId}`, { method: 'PATCH', token, body }),

  deleteOwnerBroker: (token: string, brokerId: string) =>
    request<{ ok: true }>(`/api/owners/brokers/${brokerId}`, { method: 'DELETE', token }),

  getOwnerTenantDetail: (token: string, tenantId: string) =>
    request<{
      ok: true
      tenant: Tenant & { properties?: Property }
      tickets: TenantTicket[]
      reminders: Array<{
        id: string
        reminder_type: string
        scheduled_for: string
        sent_at: string | null
        status: string
      }>
    }>(`/api/owners/tenants/${tenantId}`, { token }),

  getOwnerTenantConditionReports: (token: string, tenantId: string) =>
    request<{ ok: true; condition_reports: import('../types/api').OwnerConditionReportOverview }>(
      `/api/owners/tenants/${tenantId}/condition-reports`,
      { token },
    ),

  createOwnerTenantConditionReport: (
    token: string,
    tenantId: string,
    body: {
      report_type: 'move_in' | 'move_out'
      vacancy_campaign_id?: string | null
      trigger_reference?: string | null
    },
  ) =>
    request<{ ok: true; report: import('../types/api').ConditionReportDetail }>(
      `/api/owners/tenants/${tenantId}/condition-reports`,
      { method: 'POST', token, body },
    ),

  getOwnerConditionReport: (token: string, reportId: string) =>
    request<{ ok: true; report: import('../types/api').ConditionReportDetail }>(`/api/owners/condition-reports/${reportId}`, {
      token,
    }),

  updateOwnerConditionReportRoom: (
    token: string,
    reportId: string,
    roomEntryId: string,
    body: {
      condition_rating?: 'not_reviewed' | 'good' | 'fair' | 'poor'
      condition_notes?: string | null
    },
  ) =>
    request<{ ok: true; report: import('../types/api').ConditionReportDetail }>(
      `/api/owners/condition-reports/${reportId}/rooms/${roomEntryId}`,
      { method: 'PATCH', token, body },
    ),

  addOwnerConditionReportMedia: (
    token: string,
    reportId: string,
    body: {
      room_entry_id: string
      media_kind?: 'photo' | 'video' | 'document' | 'other'
      media_url?: string | null
      storage_path?: string | null
      mime_type?: string | null
      caption?: string | null
    },
  ) =>
    request<{ ok: true; report: import('../types/api').ConditionReportDetail }>(
      `/api/owners/condition-reports/${reportId}/media`,
      { method: 'POST', token, body },
    ),

  confirmOwnerConditionReport: (
    token: string,
    reportId: string,
    body: {
      status: 'confirmed' | 'disputed'
      note?: string | null
    },
  ) =>
    request<{ ok: true; report: import('../types/api').ConditionReportDetail }>(
      `/api/owners/condition-reports/${reportId}/confirm`,
      { method: 'POST', token, body },
    ),

  getOwnerTickets: (token: string) => request<{ ok: true; tickets: TenantTicket[] }>('/api/owners/tickets', { token }),

  getOwnerTicketDetail: (token: string, ticketId: string) =>
    request<{ ok: true; thread: SupportTicketThread }>(`/api/owners/tickets/${ticketId}`, { token }),

  replyOwnerTicket: (token: string, ticketId: string, body: { message: string }) =>
    request<{ ok: true; message: SupportTicketThread['messages'][number] }>(`/api/owners/tickets/${ticketId}/replies`, {
      method: 'POST',
      token,
      body,
    }),

  updateOwnerTicket: (
    token: string,
    ticketId: string,
    body: { status: TenantTicket['status']; closing_message?: string },
  ) =>
    request<{ ok: true; ticket: TenantTicket }>(`/api/owners/tickets/${ticketId}`, {
      method: 'PATCH',
      token,
      body,
    }),

  getOwnerTicketMaintenanceWorkflow: (token: string, ticketId: string) =>
    request<{ ok: true; maintenance: OwnerMaintenanceWorkflowOverview }>(
      `/api/owners/tickets/${ticketId}/maintenance-workflow`,
      { token },
    ),

  triageOwnerTicketMaintenanceWorkflow: (
    token: string,
    ticketId: string,
    body: {
      category?: OwnerMaintenanceWorkflowOverview['suggested_triage']['category']
      urgency?: OwnerMaintenanceWorkflowOverview['suggested_triage']['urgency']
      classification_notes?: string
    },
  ) =>
    request<{ ok: true; maintenance: OwnerMaintenanceWorkflowOverview }>(
      `/api/owners/tickets/${ticketId}/maintenance-workflow/triage`,
      {
        method: 'POST',
        token,
        body,
      },
    ),

  requestOwnerMaintenanceQuotes: (
    token: string,
    ticketId: string,
    body: {
      contractor_ids?: string[]
      request_message?: string
      expires_at?: string
    },
  ) =>
    request<{ ok: true; maintenance: OwnerMaintenanceWorkflowOverview }>(
      `/api/owners/tickets/${ticketId}/maintenance-workflow/request-quotes`,
      {
        method: 'POST',
        token,
        body,
      },
    ),

  recordOwnerMaintenanceQuote: (
    token: string,
    ticketId: string,
    body: {
      contractor_id: string
      quote_request_id?: string
      amount: number
      currency_code?: string
      scope_of_work: string
      availability_note?: string
      estimated_start_at?: string
      estimated_completion_at?: string
    },
  ) =>
    request<{ ok: true; maintenance: OwnerMaintenanceWorkflowOverview }>(
      `/api/owners/tickets/${ticketId}/maintenance-workflow/quotes`,
      {
        method: 'POST',
        token,
        body,
      },
    ),

  approveOwnerMaintenanceQuote: (
    token: string,
    ticketId: string,
    quoteId: string,
    body: {
      appointment_start_at?: string
      appointment_end_at?: string
      appointment_notes?: string
    },
  ) =>
    request<{ ok: true; maintenance: OwnerMaintenanceWorkflowOverview }>(
      `/api/owners/tickets/${ticketId}/maintenance-workflow/quotes/${quoteId}/approve`,
      {
        method: 'POST',
        token,
        body,
      },
    ),

  updateOwnerMaintenanceAssignment: (
    token: string,
    ticketId: string,
    body: {
      booking_status: string
      appointment_start_at?: string
      appointment_end_at?: string
      appointment_notes?: string
      completion_notes?: string
    },
  ) =>
    request<{ ok: true; maintenance: OwnerMaintenanceWorkflowOverview }>(
      `/api/owners/tickets/${ticketId}/maintenance-workflow/assignment`,
      {
        method: 'PATCH',
        token,
        body,
      },
    ),

  getOwnerContractors: (token: string) =>
    request<{ ok: true; contractors: ContractorDirectoryEntry[] }>('/api/owners/contractors', { token }),

  createOwnerContractor: (
    token: string,
    body: {
      company_name: string
      contact_name?: string
      email?: string
      phone?: string
      whatsapp?: string
      notes?: string
      specialties: string[]
    },
  ) => request<{ ok: true; contractor: ContractorDirectoryEntry }>('/api/owners/contractors', { method: 'POST', token, body }),

  getOwnerNotifications: (token: string) =>
    request<{ ok: true; notifications: OwnerNotification[] }>('/api/owners/notifications', { token }),

  getOwnerNotificationPreferences: (token: string) =>
    request<{ ok: true; preferences: OwnerNotificationPreferences }>('/api/owners/notifications/preferences', { token }),

  updateOwnerNotificationPreferences: (token: string, body: OwnerNotificationPreferencePatch) =>
    request<{ ok: true; preferences: OwnerNotificationPreferences }>('/api/owners/notifications/preferences', {
      method: 'PUT',
      token,
      body,
    }),

  markAllOwnerNotificationsRead: (token: string) =>
    request<{ ok: true }>('/api/owners/notifications/read-all', { method: 'PATCH', token }),

  markNotificationRead: (token: string, notificationId: string) =>
    request<{ ok: true }>(`/api/owners/notifications/${notificationId}/read`, { method: 'PATCH', token }),

  getOwnerTelegramOnboarding: (token: string) =>
    request<{ ok: true; onboarding: TelegramOnboardingState }>('/api/owners/telegram/onboarding', { token }),

  disconnectOwnerTelegram: (token: string) =>
    request<{ ok: true; disconnected: boolean }>('/api/owners/telegram/disconnect', { method: 'POST', token, body: {} }),

  getOwnerTelegramDeliveryLogs: (token: string, query: { page?: number; page_size?: number } = {}) =>
    request<{
      ok: true
      items: OwnerTelegramDeliveryLog[]
      pagination: {
        page: number
        page_size: number
        total: number
        total_pages: number
      }
    }>(`/api/owners/telegram/delivery-logs${toQueryString(query)}`, { token }),

  processOwnerReminders: (token: string) =>
    request<{
      ok: true
      result: {
        tenants_scanned: number
        reminders_generated_attempted: number
        reminders_total: number
        notifications_created: number
      }
    }>('/api/owners/process-reminders', { method: 'POST', token }),

  getOwnerAutomationSettings: (token: string) =>
    request<{ ok: true; settings: OwnerAutomationSettings }>('/api/owners/automation/settings', { token }),

  updateOwnerAutomationSettings: (
    token: string,
    body: Partial<{
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
    }>,
  ) =>
    request<{ ok: true; settings: OwnerAutomationSettings }>('/api/owners/automation/settings', {
      method: 'PUT',
      token,
      body,
    }),

  getOwnerAutomationActivity: (token: string, query: Pick<ListQueryInput, 'page' | 'page_size'> = {}) =>
    request<OwnerAutomationActivityResponse>(`/api/owners/automation/activity${toQueryString(query)}`, { token }),

  getOwnerAutomationCompliance: (token: string) =>
    request<{ ok: true; compliance: ComplianceOverview }>('/api/owners/automation/compliance', { token }),

  getOwnerAutomationPortfolioVisibility: (token: string) =>
    request<{ ok: true; portfolio_visibility: OwnerPortfolioVisibilityOverview }>(
      '/api/owners/automation/portfolio-visibility',
      { token },
    ),

  getOwnerAutomationCashFlow: (token: string) =>
    request<{ ok: true; cash_flow: OwnerCashFlowOverview }>('/api/owners/automation/cash-flow', { token }),

  generateOwnerAutomationCashFlow: (
    token: string,
    body: {
      scope?: CashFlowReportScope
      year?: number
      month?: number
    } = {},
  ) =>
    request<{
      ok: true
      result: {
        owner_id: string
        organization_id: string
        scope: CashFlowReportScope
        report_period: string
        alerts_sent: number
        cash_flow_snapshot_ids: string[]
        skipped?: boolean
        reason?: string
      }
    }>('/api/owners/automation/cash-flow/generate', {
      method: 'POST',
      token,
      body,
    }),

  getTenantSummary: (token: string) =>
    request<{ ok: true; summary: TenantSummary }>('/api/tenants/dashboard-summary', { token }),

  getTenantLeaseRenewalIntentState: (token: string) =>
    request<{ ok: true; state: TenantLeaseRenewalIntentState }>('/api/tenants/lease-renewal-intent-state', { token }),

  submitTenantLeaseRenewalIntent: (token: string, body: { decision: 'yes' | 'no' }) =>
    request<{
      ok: true
      intent: {
        id: string
        decision: 'yes' | 'no'
        lease_end_date: string
        responded_at: string
      }
    }>('/api/tenants/lease-renewal-intent', { method: 'POST', token, body }),

  getTenantRentPaymentState: (token: string) =>
    request<{ ok: true; state: TenantRentPaymentState }>('/api/tenants/rent-payment-state', { token }),

  markTenantRentPaid: (token: string) =>
    request<{ ok: true; state: TenantRentPaymentState; approval: OwnerRentPaymentApproval }>(
      '/api/tenants/rent-payment-mark-paid',
      { method: 'POST', token, body: {} },
    ),

  getTenantProperty: (token: string) =>
    request<{ ok: true; property: Property | null; tenant: Tenant }>('/api/tenants/property', { token }),

  getTenantConditionReports: (token: string) =>
    request<{ ok: true; condition_reports: import('../types/api').TenantConditionReportOverview }>('/api/tenants/condition-reports', {
      token,
    }),

  getTenantConditionReport: (token: string, reportId: string) =>
    request<{ ok: true; report: import('../types/api').ConditionReportDetail }>(`/api/tenants/condition-reports/${reportId}`, {
      token,
    }),

  addTenantConditionReportMedia: (
    token: string,
    reportId: string,
    body: {
      room_entry_id: string
      media_kind?: 'photo' | 'video' | 'document' | 'other'
      media_url?: string | null
      storage_path?: string | null
      mime_type?: string | null
      caption?: string | null
    },
  ) =>
    request<{ ok: true; report: import('../types/api').ConditionReportDetail }>(
      `/api/tenants/condition-reports/${reportId}/media`,
      { method: 'POST', token, body },
    ),

  confirmTenantConditionReport: (
    token: string,
    reportId: string,
    body: {
      status: 'confirmed' | 'disputed'
      note?: string | null
    },
  ) =>
    request<{ ok: true; report: import('../types/api').ConditionReportDetail }>(
      `/api/tenants/condition-reports/${reportId}/confirm`,
      { method: 'POST', token, body },
    ),

  getTenantTickets: (token: string) => request<{ ok: true; tickets: TenantTicket[] }>('/api/tenants/tickets', { token }),

  getTenantTicketDetail: (token: string, ticketId: string) =>
    request<{ ok: true; thread: SupportTicketThread }>(`/api/tenants/tickets/${ticketId}`, { token }),

  createTenantTicket: (token: string, body: { subject: string; message: string }) =>
    request<{ ok: true; ticket: TenantTicket }>('/api/tenants/tickets', { method: 'POST', token, body }),

  replyTenantTicket: (token: string, ticketId: string, body: { message: string }) =>
    request<{ ok: true; message: SupportTicketThread['messages'][number] }>(`/api/tenants/tickets/${ticketId}/replies`, {
      method: 'POST',
      token,
      body,
    }),

  getTenantTicketMaintenanceWorkflow: (token: string, ticketId: string) =>
    request<{ ok: true; maintenance: TenantMaintenanceWorkflowOverview }>(
      `/api/tenants/tickets/${ticketId}/maintenance-workflow`,
      { token },
    ),

  confirmTenantMaintenanceCompletion: (
    token: string,
    ticketId: string,
    body: {
      resolved: boolean
      feedback_rating?: number
      feedback_note?: string
    },
  ) =>
    request<{ ok: true; maintenance: TenantMaintenanceWorkflowOverview }>(
      `/api/tenants/tickets/${ticketId}/maintenance-workflow/completion`,
      {
        method: 'POST',
        token,
        body,
      },
    ),

  getTenantOwnerContact: (token: string) =>
    request<{ ok: true; owner: TenantOwnerContact }>('/api/tenants/owner-contact', { token }),

  getTenantTelegramOnboarding: (token: string) =>
    request<{ ok: true; onboarding: TelegramOnboardingState }>('/api/tenants/telegram/onboarding', { token }),

  disconnectTenantTelegram: (token: string) =>
    request<{ ok: true; disconnected: boolean }>('/api/tenants/telegram/disconnect', { method: 'POST', token, body: {} }),

  getAdminDashboardSummary: (token: string) =>
    request<{ ok: true; summary: AdminDashboardSummary }>('/api/admin/dashboard-summary', { token }),

  getAdminSystemHealth: (token: string) =>
    request<{ ok: true; health: AdminSystemHealth }>('/api/admin/system-health', { token }),

  getAdminOwners: (token: string, query: ListQueryInput) =>
    request<AdminListResponse<AdminOwnerRow>>(`/api/admin/owners${toQueryString(query)}`, { token }),

  getAdminOrganizations: (token: string, query: ListQueryInput) =>
    request<AdminListResponse<AdminOrganizationRow>>(`/api/admin/organizations${toQueryString(query)}`, { token }),

  getAdminOrganizationDetail: (token: string, organizationId: string) =>
    request<{ ok: true; detail: AdminOrganizationDetail }>(`/api/admin/organizations/${organizationId}`, { token }),

  getAdminTenants: (token: string, query: ListQueryInput) =>
    request<AdminListResponse<AdminTenantRow>>(`/api/admin/tenants${toQueryString(query)}`, { token }),

  getAdminProperties: (token: string, query: ListQueryInput) =>
    request<AdminListResponse<AdminPropertyRow>>(`/api/admin/properties${toQueryString(query)}`, { token }),

  getAdminTickets: (token: string, query: ListQueryInput) =>
    request<AdminListResponse<AdminTicketRow>>(`/api/admin/tickets${toQueryString(query)}`, { token }),

  getAdminTicketDetail: (token: string, ticketId: string) =>
    request<{ ok: true; thread: SupportTicketThread }>(`/api/admin/tickets/${ticketId}`, { token }),

  replyAdminTicket: (token: string, ticketId: string, body: { message: string }) =>
    request<{ ok: true; message: SupportTicketThread['messages'][number] }>(`/api/admin/tickets/${ticketId}/replies`, {
      method: 'POST',
      token,
      body,
    }),

  updateAdminTicket: (
    token: string,
    ticketId: string,
    body: { status: TenantTicket['status']; closing_message?: string },
  ) =>
    request<{ ok: true; ticket: TenantTicket }>(`/api/admin/tickets/${ticketId}`, {
      method: 'PATCH',
      token,
      body,
    }),

  getAdminContactMessages: (token: string, query: ListQueryInput) =>
    request<AdminListResponse<ContactMessage>>(`/api/admin/contact-messages${toQueryString(query)}`, { token }),

  getAdminAnalytics: (token: string, query: ListQueryInput) =>
    request<AdminAnalyticsResponse>(`/api/admin/analytics${toQueryString(query)}`, { token }),

  getAdminAiStatus: (token: string) =>
    request<{ ok: true; status: AdminAiStatus }>('/api/admin/ai-status', { token }),

  getAdminAutomationHealth: (token: string) =>
    request<{ ok: true; health: AdminAutomationHealth }>('/api/admin/automations/health', { token }),

  getAdminAutomationCompliance: (token: string, query: Pick<ListQueryInput, 'organization_id'> = {}) =>
    request<{ ok: true; compliance: ComplianceOverview }>(`/api/admin/automations/compliance${toQueryString(query)}`, {
      token,
    }),

  getAdminAutomationPortfolioVisibility: (token: string, query: Pick<ListQueryInput, 'organization_id'> = {}) =>
    request<{ ok: true; portfolio_visibility: AdminPortfolioVisibilityOverview }>(
      `/api/admin/automations/portfolio-visibility${toQueryString(query)}`,
      { token },
    ),

  getAdminAutomationCashFlow: (token: string, query: Pick<ListQueryInput, 'organization_id'> = {}) =>
    request<{ ok: true; cash_flow: AdminCashFlowOverview }>(`/api/admin/automations/cash-flow${toQueryString(query)}`, {
      token,
    }),

  getAdminAutomationVacancyCampaigns: (token: string, query: Pick<ListQueryInput, 'organization_id'> = {}) =>
    request<{ ok: true; vacancy: AdminVacancyOverview }>(`/api/admin/automations/vacancy-campaigns${toQueryString(query)}`, {
      token,
    }),

  getAdminAutomationScreening: (
    token: string,
    query: Pick<ListQueryInput, 'organization_id' | 'page' | 'page_size'> & {
      recommendation_category?: 'green' | 'amber' | 'red' | 'unscored'
      final_disposition?: 'in_review' | 'rejected' | 'viewing' | 'lease_prep' | 'withdrawn' | 'approved'
    } = {},
  ) => request<{ ok: true; screening: AdminScreeningOverview }>(`/api/admin/automations/screening${toQueryString(query)}`, { token }),

  getAdminAutomationConditionReports: (
    token: string,
    query: Pick<ListQueryInput, 'organization_id' | 'page' | 'page_size'> & {
      report_type?: 'move_in' | 'move_out'
    } = {},
  ) =>
    request<{ ok: true; condition_reports: import('../types/api').AdminConditionReportOverview }>(
      `/api/admin/automations/condition-reports${toQueryString(query)}`,
      { token },
    ),

  getAdminAutomationJobs: (token: string, query: ListQueryInput = {}) =>
    request<{ ok: true; items: AutomationJob[]; pagination: import('../types/api').PaginationMeta }>(
      `/api/admin/automations/jobs${toQueryString(query)}`,
      { token },
    ),

  getAdminAutomationRuns: (token: string, query: ListQueryInput = {}) =>
    request<{ ok: true; items: import('../types/api').AutomationRun[]; pagination: import('../types/api').PaginationMeta }>(
      `/api/admin/automations/runs${toQueryString(query)}`,
      { token },
    ),

  getAdminAutomationErrors: (token: string, query: ListQueryInput = {}) =>
    request<{ ok: true; items: import('../types/api').AutomationError[]; pagination: import('../types/api').PaginationMeta }>(
      `/api/admin/automations/errors${toQueryString(query)}`,
      { token },
    ),

  getAdminBlogPosts: (token: string, query: ListQueryInput) =>
    request<AdminListResponse<BlogPost>>(`/api/admin/blog${toQueryString(query)}`, { token }),

  createAdminBlogPost: (
    token: string,
    body: {
      title: string
      slug: string
      content: string
      excerpt: string
      cover_image?: string | null
      author?: string
      published?: boolean
    },
  ) => request<{ ok: true; post: BlogPost }>('/api/admin/blog', { method: 'POST', token, body }),

  updateAdminBlogPost: (
    token: string,
    blogPostId: string,
    body: Partial<{
      title: string
      slug: string
      content: string
      excerpt: string
      cover_image: string | null
      author: string
      published: boolean
    }>,
  ) => request<{ ok: true; post: BlogPost }>(`/api/admin/blog/${blogPostId}`, { method: 'PUT', token, body }),

  deleteAdminBlogPost: (token: string, blogPostId: string) =>
    request<{ ok: true }>(`/api/admin/blog/${blogPostId}`, { method: 'DELETE', token }),

  getBlogPosts: (query: ListQueryInput = {}) =>
    request<BlogListResponse>(`/api/blog${toQueryString(query)}`),

  getBlogPostBySlug: (slug: string) =>
    request<{ ok: true; post: BlogPost }>(`/api/blog/${encodeURIComponent(slug)}`),
}

export { API_BASE_URL }
