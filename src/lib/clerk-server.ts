import { clerkClient } from '@clerk/nextjs/server'

export interface ClerkUser {
  id: string
  email: string | null
  name: string | null
}

/**
 * Get user information from Clerk by user ID
 * @param userId - Clerk user ID
 * @returns User information including email and name, or null if not found
 */
export async function getClerkUserById(userId: string): Promise<ClerkUser | null> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    if (!user) {
      console.error(`Clerk user not found for ID: ${userId}`)
      return null
    }

    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || null,
      name: user.fullName || user.firstName || null
    }
  } catch (error) {
    console.error('Error fetching Clerk user:', error)
    return null
  }
}

/**
 * Get user email from Clerk by user ID
 * @param userId - Clerk user ID
 * @returns User email or null if not found
 */
export async function getClerkUserEmail(userId: string): Promise<string | null> {
  try {
    const user = await getClerkUserById(userId)
    return user?.email || null
  } catch (error) {
    console.error('Error fetching Clerk user email:', error)
    return null
  }
}