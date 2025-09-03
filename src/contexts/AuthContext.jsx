import { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { serverTimestamp } from 'firebase/firestore'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

// Use a different export pattern for Fast Refresh compatibility
const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const signUp = async (userData) => {
    try {
      setLoading(true)
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      )
      
      const user = userCredential.user
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: userData.displayName
      })
      
      // Store additional user data in Firestore
      const userDoc = {
        uid: user.uid,
        email: userData.email,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Add admin-specific fields
      if (userData.role === 'admin') {
        userDoc.municipalCode = userData.municipalCode
        userDoc.designation = userData.designation
        userDoc.department = userData.department
        userDoc.areaName = userData.areaName
      }
      
      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), userDoc)
      
      setUser(user)
      return user
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign in with email and password
  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      return result
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })

      // Prefer popup, fall back to redirect if blocked
      let result
      try {
        result = await signInWithPopup(auth, provider)
      } catch (err) {
        // If popup is blocked or cancelled due to another popup, fallback to redirect
        if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, provider)
          return // Flow will continue in getRedirectResult handler below
        }
        throw err
      }
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      
      if (!userDoc.exists()) {
        // Create user document for new Google users
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: 'citizen',
          createdAt: new Date().toISOString(),
          photoURL: result.user.photoURL
        })
      }
      
      toast.success('Welcome back!')
      return result
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Sign out
  async function logout() {
    try {
      await signOut(auth)
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Get user data from Firestore
  async function getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return userDoc.data()
      }
      return { role: 'citizen' }
    } catch (error) {
      console.error('Error getting user data:', error)
      return { role: 'citizen' }
    }
  }

  useEffect(() => {
    // Ensure auth state persists between reloads
    setPersistence(auth, browserLocalPersistence).catch(() => {})

    // Handle redirect result for Google sign-in fallback
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          // Ensure Firestore user doc exists
          const userDoc = await getDoc(doc(db, 'users', result.user.uid))
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', result.user.uid), {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              role: 'citizen',
              createdAt: new Date().toISOString(),
              photoURL: result.user.photoURL
            })
          }
          toast.success('Welcome back!')
        }
      })
      .catch((error) => {
        // Surface meaningful redirect errors but don't block app
        if (error?.code && error.code !== 'auth/no-auth-event') {
          toast.error(error.message)
        }
      })

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data including role and municipal corporation
        const userData = await getUserData(user.uid)
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: userData.role,
          selectedMunicipalCorp: userData.selectedMunicipalCorp,
          municipalCode: userData.municipalCode,
          designation: userData.designation,
          department: userData.department,
          areaName: userData.areaName
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    signUp,
    login,
    signInWithGoogle,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
