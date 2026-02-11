/**
 * API client for backend communication
 * Now uses JWT authentication — no more manual API key headers
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface AuthUser {
    id: number
    email: string
    name: string
    avatar_url: string | null
    role: 'admin' | 'user'
    is_approved: boolean
}

class ApiClient {
    private baseUrl: string
    private token: string | null = null

    constructor(baseUrl: string = API_BASE) {
        this.baseUrl = baseUrl
    }

    setToken(token: string | null) {
        this.token = token
    }

    private authHeaders(): Record<string, string> {
        const headers: Record<string, string> = {}
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`
        }
        return headers
    }

    // ── Auth ──────────────────────────

    async googleLogin(idToken: string): Promise<{
        success: boolean
        token?: string
        user?: AuthUser
        error?: string
    }> {
        const response = await fetch(`${this.baseUrl}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: idToken }),
            credentials: 'include',
        })
        return response.json()
    }

    async getMe(): Promise<{
        success: boolean
        user?: AuthUser
        error?: string
    }> {
        const response = await fetch(`${this.baseUrl}/api/auth/me`, {
            headers: this.authHeaders(),
            credentials: 'include',
        })
        if (!response.ok) {
            return { success: false, error: 'Not authenticated' }
        }
        return response.json()
    }

    async logout(): Promise<void> {
        await fetch(`${this.baseUrl}/api/auth/logout`, {
            method: 'POST',
            headers: this.authHeaders(),
            credentials: 'include',
        })
    }

    // ── User API Keys ─────────────────

    async getApiKeys(): Promise<{
        success: boolean
        kie_api_key_masked?: string
        has_kie_key?: boolean
    }> {
        const response = await fetch(`${this.baseUrl}/api/user/api-keys`, {
            headers: this.authHeaders(),
            credentials: 'include',
        })
        return response.json()
    }

    async saveApiKeys(kieApiKey: string): Promise<{ success: boolean; message?: string }> {
        const response = await fetch(`${this.baseUrl}/api/user/api-keys`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...this.authHeaders(),
            },
            body: JSON.stringify({ kie_api_key: kieApiKey }),
            credentials: 'include',
        })
        return response.json()
    }

    async getCreditBalance(): Promise<{
        success: boolean
        credits?: number
        error?: string
    }> {
        const response = await fetch(`${this.baseUrl}/api/user/credit-balance`, {
            headers: this.authHeaders(),
            credentials: 'include',
        })
        return response.json()
    }

    // ── Admin ─────────────────────────

    async getUsers(): Promise<{
        users: Array<{
            id: number
            email: string
            name: string
            avatar_url: string | null
            role: string
            is_approved: boolean
            created_at: string
        }>
    }> {
        const response = await fetch(`${this.baseUrl}/api/admin/users`, {
            headers: this.authHeaders(),
            credentials: 'include',
        })
        return response.json()
    }

    async approveUser(userId: number): Promise<{ success: boolean }> {
        const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}/approve`, {
            method: 'PUT',
            headers: this.authHeaders(),
            credentials: 'include',
        })
        return response.json()
    }

    async rejectUser(userId: number): Promise<{ success: boolean }> {
        const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}/reject`, {
            method: 'PUT',
            headers: this.authHeaders(),
            credentials: 'include',
        })
        return response.json()
    }

    // ── Upload ────────────────────────

    async uploadImage(
        file: File
    ): Promise<{ success: boolean; url?: string; error?: string }> {
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch(`${this.baseUrl}/api/upload-image`, {
                method: 'POST',
                headers: this.authHeaders(),
                body: formData,
                credentials: 'include',
            })

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    error: typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail) || 'Upload failed',
                }
            }

            return data
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Network error during upload',
            }
        }
    }

    // ── Generate ──────────────────────

    async previewPrompt(data: {
        productName: string
        highlight: string
        style: string
        persona: string
    }): Promise<{ prompt: string; style: string; persona: string }> {
        const response = await fetch(`${this.baseUrl}/api/preview-prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.authHeaders(),
            },
            body: JSON.stringify({
                product_name: data.productName,
                highlight: data.highlight,
                style: data.style,
                persona: data.persona,
            }),
            credentials: 'include',
        })

        return response.json()
    }

    async generateTask(
        data: {
            imageUrl: string
            productName: string
            highlight: string
            style: string
            persona: string
            aspectRatio: string
            duration: number
            batchCount: number
            removeWatermark: boolean
        }
    ): Promise<{ success: boolean; task_ids?: string[]; error?: string }> {
        const response = await fetch(`${this.baseUrl}/api/generate-task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.authHeaders(),
            },
            body: JSON.stringify({
                image_url: data.imageUrl,
                product_name: data.productName,
                highlight: data.highlight,
                style: data.style,
                persona: data.persona,
                aspect_ratio: data.aspectRatio,
                duration: data.duration,
                batch_count: data.batchCount,
                remove_watermark: data.removeWatermark,
            }),
            credentials: 'include',
        })

        return response.json()
    }

    // ── Status ────────────────────────

    async checkStatus(
        taskIds: string[]
    ): Promise<{
        tasks: Array<{
            task_id: string
            status: string
            progress: number
            video_url: string | null
            thumbnail_url: string | null
            error: string | null
        }>
    }> {
        const ids = taskIds.join(',')
        const response = await fetch(`${this.baseUrl}/api/status?ids=${encodeURIComponent(ids)}`, {
            method: 'GET',
            headers: this.authHeaders(),
            credentials: 'include',
        })

        return response.json()
    }
    async getTasks(): Promise<{
        tasks: Array<{
            task_id: string
            status: string
            progress: number
            video_url: string | null
            thumbnail_url: string | null
            error: string | null
            created_at: string | null
        }>
    }> {
        const response = await fetch(`${this.baseUrl}/api/tasks`, {
            method: 'GET',
            headers: this.authHeaders(),
            credentials: 'include',
        })
        return response.json()
    }
}

export const api = new ApiClient()
