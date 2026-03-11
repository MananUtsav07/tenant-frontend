import type {
  AdminAnalyticsResponse,
  AdminAiStatus,
  AdminAuthPayload,
  AdminDashboardSummary,
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
  ContactMessage,
  ContactMessageReceipt,
  Owner,
  OwnerAuthPayload,
  OwnerAiSettingsResponse,
  OwnerNotification,
  OwnerRentPaymentApproval,
  OwnerSummary,
  Property,
  Tenant,
  TenantAuthPayload,
  TenantOwnerContact,
  TenantSummary,
  TenantRentPaymentState,
  TenantTicket,
  PublicOperationsSnapshot,
} from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8787'

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
}

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

  ownerMe: (token: string) => request<{ ok: true; owner: Owner }>('/api/auth/owner/me', { token }),

  tenantLogin: (body: { tenant_access_id: string; password: string; email?: string }) =>
    request<TenantAuthPayload & { ok: true }>('/api/auth/tenant/login', { method: 'POST', body }),

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

  getOwnerTickets: (token: string) => request<{ ok: true; tickets: TenantTicket[] }>('/api/owners/tickets', { token }),

  updateOwnerTicket: (token: string, ticketId: string, status: TenantTicket['status']) =>
    request<{ ok: true; ticket: TenantTicket }>(`/api/owners/tickets/${ticketId}`, {
      method: 'PATCH',
      token,
      body: { status },
    }),

  getOwnerNotifications: (token: string) =>
    request<{ ok: true; notifications: OwnerNotification[] }>('/api/owners/notifications', { token }),

  markNotificationRead: (token: string, notificationId: string) =>
    request<{ ok: true }>(`/api/owners/notifications/${notificationId}/read`, { method: 'PATCH', token }),

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

  getTenantSummary: (token: string) =>
    request<{ ok: true; summary: TenantSummary }>('/api/tenants/dashboard-summary', { token }),

  getTenantRentPaymentState: (token: string) =>
    request<{ ok: true; state: TenantRentPaymentState }>('/api/tenants/rent-payment-state', { token }),

  markTenantRentPaid: (token: string) =>
    request<{ ok: true; state: TenantRentPaymentState; approval: OwnerRentPaymentApproval }>(
      '/api/tenants/rent-payment-mark-paid',
      { method: 'POST', token, body: {} },
    ),

  getTenantProperty: (token: string) =>
    request<{ ok: true; property: Property | null; tenant: Tenant }>('/api/tenants/property', { token }),

  getTenantTickets: (token: string) => request<{ ok: true; tickets: TenantTicket[] }>('/api/tenants/tickets', { token }),

  createTenantTicket: (token: string, body: { subject: string; message: string }) =>
    request<{ ok: true; ticket: TenantTicket }>('/api/tenants/tickets', { method: 'POST', token, body }),

  getTenantOwnerContact: (token: string) =>
    request<{ ok: true; owner: TenantOwnerContact }>('/api/tenants/owner-contact', { token }),

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

  getAdminContactMessages: (token: string, query: ListQueryInput) =>
    request<AdminListResponse<ContactMessage>>(`/api/admin/contact-messages${toQueryString(query)}`, { token }),

  getAdminAnalytics: (token: string, query: ListQueryInput) =>
    request<AdminAnalyticsResponse>(`/api/admin/analytics${toQueryString(query)}`, { token }),

  getAdminAiStatus: (token: string) =>
    request<{ ok: true; status: AdminAiStatus }>('/api/admin/ai-status', { token }),

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
