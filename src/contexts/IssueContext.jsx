import { createContext, useContext, useState, useEffect } from 'react'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import toast from 'react-hot-toast'

const IssueContext = createContext()

// Use a different export pattern for Fast Refresh compatibility
const useIssues = () => {
  const context = useContext(IssueContext)
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider')
  }
  return context
}

export { useIssues }

export function IssueProvider({ children }) {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    area: 'all',
    municipalCorp: 'all'
  })

  // Issue categories
  const categories = [
    'roads-transport',
    'waste-management',
    'water-drainage',
    'electricity-lighting',
    'environment-parks',
    'public-safety-others'
  ]

  // Issue statuses
  const statuses = ['pending', 'in-progress', 'resolved']

  // Add new issue
  async function addIssue(issueData) {
    try {
      console.log('=== IssueContext: addIssue called ===')
      console.log('Issue data received:', issueData)
      console.log('Database instance:', db)
      console.log('Storage instance:', storage)
      
      setLoading(true)
      
      // Temporarily skip media upload to test basic functionality
      let mediaUrls = []
      if (issueData.media && issueData.media.length > 0) {
        console.log('IssueContext: Media files detected but Storage not enabled yet')
        // For now, just store file names instead of uploading
        mediaUrls = issueData.media.map(file => `File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
      }

      // Create issue document
      const issueDoc = {
        ...issueData,
        mediaUrls,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        upvotes: 0,
        comments: [],
        escalated: false,
        escalatedAt: null,
        socialMediaPosts: {}
      }
      
      // Remove File objects from the document before sending to Firestore
      const { media, ...cleanIssueDoc } = issueDoc
      
      console.log('IssueContext: Clean issue document to create:', cleanIssueDoc)
      console.log('IssueContext: About to call addDoc...')

      const docRef = await addDoc(collection(db, 'issues'), cleanIssueDoc)
      console.log('IssueContext: Issue document created successfully with ID:', docRef.id)
      
      toast.success('Issue reported successfully!')
      return docRef
    } catch (error) {
      console.error('=== IssueContext: ERROR DETAILS ===')
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error name:', error.name)
      console.error('Error stack:', error.stack)
      console.error('Full error object:', error)
      
      toast.error(`Failed to report issue: ${error.message}`)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update issue status
  async function updateIssueStatus(issueId, newStatus, adminNotes = '') {
    try {
      const issueRef = doc(db, 'issues', issueId)
      await updateDoc(issueRef, {
        status: newStatus,
        adminNotes,
        updatedAt: serverTimestamp()
      })
      
      toast.success('Issue status updated successfully!')
    } catch (error) {
      console.error('Error updating issue status:', error)
      toast.error('Failed to update issue status')
    }
  }

  // Add comment to issue
  async function addComment(issueId, comment) {
    try {
      const issueRef = doc(db, 'issues', issueId)
      await updateDoc(issueRef, {
        comments: [...(issues.find(i => i.id === issueId)?.comments || []), comment],
        updatedAt: serverTimestamp()
      })
      
      toast.success('Comment added successfully!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  // Upvote issue
  async function upvoteIssue(issueId) {
    try {
      const issueRef = doc(db, 'issues', issueId)
      const currentIssue = issues.find(i => i.id === issueId)
      const newUpvotes = (currentIssue?.upvotes || 0) + 1
      
      await updateDoc(issueRef, {
        upvotes: newUpvotes,
        updatedAt: serverTimestamp()
      })
      
      toast.success('Issue upvoted!')
    } catch (error) {
      console.error('Error upvoting issue:', error)
      toast.error('Failed to upvote issue')
    }
  }

  // Escalate issue
  async function escalateIssue(issueId) {
    try {
      const issueRef = doc(db, 'issues', issueId)
      await updateDoc(issueRef, {
        escalated: true,
        escalatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // TODO: Implement social media posting logic
      // This would call Firebase Cloud Functions to post to Instagram/Twitter
      
      toast.success('Issue escalated to social media')
    } catch (error) {
      console.error('Error escalating issue:', error)
      toast.error('Failed to escalate issue')
    }
  }

  // Get filtered issues
  function getFilteredIssues() {
    let filtered = [...issues]
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(issue => issue.status === filters.status)
    }
    
    if (filters.category !== 'all') {
      filtered = filtered.filter(issue => issue.category === filters.category)
    }
    
    if (filters.area !== 'all') {
      filtered = filtered.filter(issue => issue.area === filters.area)
    }
    
    if (filters.municipalCorp !== 'all') {
      filtered = filtered.filter(issue => issue.municipalCorp === filters.municipalCorp)
    }
    
    return filtered
  }

  // Get issues by user
  function getIssuesByUser(userId) {
    return issues.filter(issue => issue.userId === userId)
  }

  // Get issues by municipal corporation (by name or code)
  function getIssuesByMunicipalCorp(municipalCorp) {
    // If it's a 6-digit code, filter by municipalCode
    if (municipalCorp && municipalCorp.length === 6 && /^\d{6}$/.test(municipalCorp)) {
      return issues.filter(issue => issue.municipalCode === municipalCorp)
    }
    // Otherwise filter by municipalCorp name
    return issues.filter(issue => issue.municipalCorp === municipalCorp)
  }

  // Get statistics
  function getStatistics() {
    const total = issues.length
    const pending = issues.filter(i => i.status === 'pending').length
    const inProgress = issues.filter(i => i.status === 'in-progress').length
    const resolved = issues.filter(i => i.status === 'resolved').length
    const escalated = issues.filter(i => i.escalated).length
    
    const categoryStats = categories.reduce((acc, category) => {
      acc[category] = issues.filter(i => i.category === category).length
      return acc
    }, {})
    
    return {
      total,
      pending,
      inProgress,
      resolved,
      escalated,
      categoryStats
    }
  }

  // Listen to issues changes
  useEffect(() => {
    const q = query(
      collection(db, 'issues'),
      orderBy('createdAt', 'desc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setIssues(issuesData)
    })
    
    return unsubscribe
  }, [])

  const value = {
    issues,
    loading,
    filters,
    setFilters,
    categories,
    statuses,
    addIssue,
    updateIssueStatus,
    addComment,
    upvoteIssue,
    escalateIssue,
    getFilteredIssues,
    getIssuesByUser,
    getIssuesByMunicipalCorp,
    getStatistics
  }

  return (
    <IssueContext.Provider value={value}>
      {children}
    </IssueContext.Provider>
  )
}
