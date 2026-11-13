import type { AuthResponse, User, UserRole } from '../types'

const TOKEN_KEY = 'evalia_jwt_token'
const USER_KEY = 'evalia_user_data'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(USER_KEY)
  if (!data) return null
  try {
    return JSON.parse(data) as User
  } catch {
    return null
  }
}

export function saveAuthSession(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.token)
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id: auth.id,
      name: auth.name,
      email: auth.email,
      role: auth.role,
    })
  )
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function handleResponse(res: Response, defaultError: string): Promise<AuthResponse> {
  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    // Si la réponse n'est pas du JSON (ex: page HTML d'erreur 404/500 de WildFly)
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        "Serveur backend (WildFly) non déployé ou route introuvable (404). Assurez-vous d'avoir redémarré le serveur WildFly avec 'mvn wildfly:dev'."
      )
    }
    const message = data?.error || (text && text.length < 200 ? text : defaultError)
    throw new Error(message)
  }

  if (!data) {
    throw new Error(defaultError)
  }

  return data as AuthResponse
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/evalia/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const auth = await handleResponse(res, 'Identifiants invalides')
  saveAuthSession(auth)
  return auth
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResponse> {
  const res = await fetch('/evalia/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  })

  const auth = await handleResponse(res, "Erreur lors de l'inscription")
  saveAuthSession(auth)
  return auth
}
