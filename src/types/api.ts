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
  created_at: string
}

export type Tenant = {
  id: string
  organization_id: string
  owner_id: string
  property_id: string
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
  created_at: string
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
