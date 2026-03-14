import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'

import { AdminPagination } from '../../components/admin/AdminPagination'
import { AdminListToolbar } from '../../components/admin/AdminListToolbar'
import { Button } from '../../components/common/Button'
import { DataTable } from '../../components/common/DataTable'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import { FormInput, FormTextarea } from '../../components/common/FormInput'
import { FormSelect } from '../../components/common/FormSelect'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { dashboardFormPanelClassName } from '../../components/common/formTheme'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { api } from '../../services/api'
import type { BlogPost, PaginationMeta } from '../../types/api'
import { formatDateTime } from '../../utils/date'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type BlogForm = {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  author: string
  published: boolean
}

const emptyBlogForm: BlogForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  author: '',
  published: false,
}

export function AdminBlogPage() {
  const { token } = useAdminAuth()
  const [items, setItems] = useState<BlogPost[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  })
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null)
  const [form, setForm] = useState<BlogForm>(emptyBlogForm)

  const formTitle = useMemo(
    () => (editingBlogId ? 'Edit blog post' : 'Create blog post'),
    [editingBlogId],
  )

  const loadPosts = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await api.getAdminBlogPosts(token, {
        page: pagination.page,
        page_size: pagination.page_size,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
      })
      setItems(response.items)
      setPagination(response.pagination)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }, [token, pagination.page, pagination.page_size, search, sortBy, sortOrder])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const resetForm = () => {
    setEditingBlogId(null)
    setForm(emptyBlogForm)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      setBusy(true)
      setError(null)
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        cover_image: form.cover_image.trim() || null,
        author: form.author.trim() || undefined,
        published: form.published,
      }

      if (editingBlogId) {
        await api.updateAdminBlogPost(token, editingBlogId, payload)
      } else {
        await api.createAdminBlogPost(token, payload)
      }

      resetForm()
      await loadPosts()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save blog post')
    } finally {
      setBusy(false)
    }
  }

  const beginEdit = (post: BlogPost) => {
    setEditingBlogId(post.id)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.cover_image ?? '',
      author: post.author,
      published: post.published,
    })
  }

  const handleDelete = async (postId: string) => {
    if (!token) {
      return
    }

    try {
      setBusy(true)
      await api.deleteAdminBlogPost(token, postId)
      await loadPosts()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete blog post')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="ph-title text-2xl font-semibold text-[var(--ph-text)]">Blog Management</h2>
        <p className="mt-2 text-sm text-[var(--ph-text-muted)]">Create, publish, and maintain public blog content.</p>
      </div>

      <form onSubmit={handleSubmit} className={dashboardFormPanelClassName}>
        <h3 className="ph-title text-lg font-semibold text-[var(--ph-text)]">{formTitle}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormInput
            label="Title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
                slug: current.slug ? current.slug : slugify(event.target.value),
              }))
            }
            required
          />
          <FormInput
            label="Slug"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
            required
          />
          <FormTextarea
            label="Excerpt"
            rows={3}
            value={form.excerpt}
            onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
            required
          />
          <FormInput
            label="Cover Image URL"
            value={form.cover_image}
            onChange={(event) => setForm((current) => ({ ...current, cover_image: event.target.value }))}
          />
          <FormInput
            label="Author"
            value={form.author}
            onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
          />
          <FormSelect
            label="Published"
            value={form.published ? 'true' : 'false'}
            onChange={(event) => setForm((current) => ({ ...current, published: event.target.value === 'true' }))}
          >
            <option value="false">Draft</option>
            <option value="true">Published</option>
          </FormSelect>
        </div>

        <div className="mt-4">
          <FormTextarea
            label="Content"
            rows={10}
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            required
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="secondary"
            disabled={busy}
            iconLeft={editingBlogId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          >
            {editingBlogId ? 'Save Post' : 'Create Post'}
          </Button>
          {editingBlogId ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel Edit
            </Button>
          ) : null}
        </div>
      </form>

      <AdminListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        sortBy={sortBy}
        onSortByChange={(value) => {
          setSortBy(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        sortOrder={sortOrder}
        onSortOrderChange={(value) => {
          setSortOrder(value)
          setPagination((current) => ({ ...current, page: 1 }))
        }}
        sortOptions={[
          { value: 'created_at', label: 'Created' },
          { value: 'title', label: 'Title' },
          { value: 'published', label: 'Published' },
        ]}
      />

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState message="Loading blog posts..." rows={5} /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="No blog posts found" description="Create your first blog post using the form above." />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <DataTable headers={['Title', 'Slug', 'Status', 'Created', 'Actions']}>
            {items.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--ph-text)]">{post.title}</p>
                  <p className="text-xs text-[var(--ph-text-muted)]">{post.author}</p>
                </td>
                <td className="px-4 py-3 text-[var(--ph-text-soft)]">{post.slug}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={post.published ? 'active' : 'inactive'} />
                </td>
                <td className="px-4 py-3 text-[var(--ph-text-muted)]">{formatDateTime(post.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => beginEdit(post)}
                      iconLeft={<Pencil className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[rgba(244,163,163,0.28)] bg-[rgba(120,28,28,0.14)] text-red-200 hover:bg-[rgba(120,28,28,0.2)]"
                      onClick={() => void handleDelete(post.id)}
                      iconLeft={<Trash2 className="h-3.5 w-3.5" />}
                      disabled={busy}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>

          <AdminPagination
            page={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
          />
        </>
      ) : null}
    </section>
  )
}
