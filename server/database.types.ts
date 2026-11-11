export interface Database {
  public: {
    Tables: {
      photo_transfers: {
        Row: {
          id: string
          share_token_hash: string
          manage_token_hash: string
          storage_path: string
          status: string
          mime_type: string
          expected_size_bytes: number
          size_bytes: number | null
          request_fingerprint: string
          created_at: string
          expires_at: string
          completed_at: string | null
        }
        Insert: {
          id: string
          share_token_hash: string
          manage_token_hash: string
          storage_path: string
          status?: string
          mime_type: string
          expected_size_bytes: number
          size_bytes?: number | null
          request_fingerprint: string
          created_at?: string
          expires_at: string
          completed_at?: string | null
        }
        Update: {
          status?: string
          size_bytes?: number | null
          completed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
