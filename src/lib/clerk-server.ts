import { clerkClient } from '@clerk/nextjs/server'

export interface ClerkUser {
  id: string
  email: string | null
  name: string | null
}

/**
 * Retrieves a Clerk user by ID and returns a simplified user object.
 * @param userId - The ID of the user to fetch
 * @returns Promise resolving to a ClerkUser object (with id, email, and name) or null if not found
 * @throws Logs error to console if API call fails
 */
export async function getClerkUserById(userId: string): Promise<ClerkUser | null> {
  try {
    console.log('=== getClerkUserById Debug ===')
    console.log('Input userId:', userId)
    
    const client = await clerkClient()
    console.log('Clerk client created successfully')
    
    const user = await client.users.getUser(userId)
    console.log('User fetched from Clerk:', user ? 'Found' : 'Not found')
    
    if (!user) {
      console.log('User not found in Clerk')
      return null
    }

    console.log('User details:')
    console.log('- ID:', user.id)
    console.log('- First name:', user.firstName)
    console.log('- Last name:', user.lastName)
    console.log('- Email addresses count:', user.emailAddresses.length)
    console.log('- Primary email ID:', user.primaryEmailAddressId)
    console.log('- Email addresses:', user.emailAddresses.map(e => ({
      id: e.id,
      email: e.emailAddress,
      isPrimary: e.id === user.primaryEmailAddressId
    })))

    // Get primary email address
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)
    console.log('Primary email found:', primaryEmail?.emailAddress || 'None')
    
    const result = {
      id: user.id,
      email: primaryEmail?.emailAddress || null,
      name: user.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : null
    }
    
    console.log('Returning user object:', result)
    console.log('=== End getClerkUserById Debug ===')
    
    return result
  } catch (error) {
    console.error('=== getClerkUserById Error ===')
    console.error('Error fetching Clerk user:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('=== End getClerkUserById Error ===')
    return null
  }
}