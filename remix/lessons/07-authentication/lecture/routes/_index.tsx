import { LoaderArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { storage } from '../utils/auth.server'

export const loader = async ({ request }: LoaderArgs) => {
  // Get the session from the cookie
  const session = await storage.getSession(request.headers.get('Cookie'))

  // Get the userId from the session if it exists
  let userId = session.get('userId') as string | undefined

  return json({ userId: userId !== undefined && parseInt(userId) })
}

export default function () {
  const { userId } = useLoaderData<typeof loader>()
  return userId ? <div>User ID is {userId}</div> : <div>User is not logged in</div>
}
