import 'next-auth'

declare module 'next-auth' {
  interface Session {
    youtubeChannel?: {
      id: string
      title: string
      description?: string | null
      thumbnail?: string | null
      customUrl?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    youtubeChannel?: {
      id: string
      title: string
      description?: string | null
      thumbnail?: string | null
      customUrl?: string | null
    }
  }
}
