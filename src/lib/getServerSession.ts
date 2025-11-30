'use server'

import { getServerSession as getSession } from 'next-auth/next'
import { AuthOptions, Session } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const getServerSession = async (): Promise<Session | null> => {
  return await getSession(authOptions as AuthOptions)
}
