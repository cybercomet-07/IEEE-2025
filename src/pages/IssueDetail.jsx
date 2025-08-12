import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useIssues } from '../contexts/IssueContext'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  MessageSquare, 
  TrendingUp,
  Edit,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { issues, addComment, upvoteIssue, escalateIssue } = useIssues()
  const [issue, setIssue] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const foundIssue = issues.find(i => i.id === id)
    setIssue(foundIssue)
  }, [id, issues])

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issue...</p>
        </div>
      </div>
    )
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setLoading(true)
      await addComment(issue.id, {
        text: comment,
        authorId: user.uid,
        authorName: user.displayName
      })
      setComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async () => {
    try {
      await upvoteIssue(issue.id)
    } catch (error) {
      console.error('Error upvoting:', error)
    }
  }

  const handleEscalate = async () => {
    try {
      await escalateIssue(issue.id)
    } catch (error) {
      console.error('Error escalating:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'roads-transport': '🛣️',
      'waste-management': '🗑️',
      'water-drainage': '💧',
      'electricity-lighting': '💡',
      'environment-parks': '🌳',
      'public-safety-others': '🚨'
    }
    return icons[category] || '📋'
  }

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'roads-transport': 'Roads & Transport',
      'waste-management': 'Waste Management',
      'water-drainage': 'Water & Drainage',
      'electricity-lighting': 'Electricity & Lighting',
      'environment-parks': 'Environment & Parks',
      'public-safety-others': 'Public Safety & Others'
    }
    return categoryLabels[category] || category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue Details</h1>
          <p className="text-gray-600 mt-1">View and track this civic issue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">
                  {getCategoryIcon(issue.category)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {getCategoryLabel(issue.category)}
                  </h2>
                  {issue.subcategory && (
                    <p className="text-sm text-blue-600 font-medium">
                      {issue.subcategory}
                    </p>
                  )}
                  <p className="text-gray-600">
                    {issue.area}
                  </p>
                </div>
              </div>
              
              <span className={`status-badge ${getStatusColor(issue.status)}`}>
                {getStatusIcon(issue.status)}
                <span className="ml-1 capitalize">{issue.status}</span>
              </span>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">{issue.description}</p>
            </div>

            {/* Issue Meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{issue.userName}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {issue.createdAt && formatDistanceToNow(
                    new Date(issue.createdAt.seconds * 1000),
                    { addSuffix: true }
                  )}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{issue.area}</span>
              </div>
            </div>

            {/* Media Gallery */}
            {issue.mediaUrls && issue.mediaUrls.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Media</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issue.mediaUrls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleUpvote}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>{issue.upvotes || 0} upvotes</span>
                </button>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <MessageSquare className="h-5 w-5" />
                  <span>{issue.comments?.length || 0} comments</span>
                </div>
              </div>

              {user?.role === 'admin' && issue.status !== 'resolved' && (
                <button
                  onClick={handleEscalate}
                  className="btn-primary"
                >
                  Escalate to Social Media
                </button>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
            
            {/* Add Comment */}
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="input-field flex-1"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !comment.trim()}
                  className="btn-primary"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.authorName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Updates */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Updates</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Issue Reported</p>
                  <p className="text-xs text-gray-500">
                    {issue.createdAt && formatDistanceToNow(
                      new Date(issue.createdAt.seconds * 1000),
                      { addSuffix: true }
                    )}
                  </p>
                </div>
              </div>
              
              {issue.status === 'in-progress' && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Work Started</p>
                    <p className="text-xs text-gray-500">Issue is being addressed</p>
                  </div>
                </div>
              )}
              
              {issue.status === 'resolved' && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Issue Resolved</p>
                    <p className="text-xs text-gray-500">Problem has been fixed</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Info */}
          {issue.latitude && issue.longitude && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{issue.area}</span>
                </div>
                
                {issue.address && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Address:</p>
                    <p className="mt-1">{issue.address}</p>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Coordinates:</p>
                  <p className="mt-1 font-mono">
                    {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Issue Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Statistics</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Upvotes</span>
                <span className="text-sm font-medium text-gray-900">{issue.upvotes || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Comments</span>
                <span className="text-sm font-medium text-gray-900">{issue.comments?.length || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Days Open</span>
                <span className="text-sm font-medium text-gray-900">
                  {issue.createdAt ? 
                    Math.ceil((Date.now() - issue.createdAt.seconds * 1000) / (1000 * 60 * 60 * 24)) : 
                    0
                  }
                </span>
              </div>
              
              {issue.escalated && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Escalated</span>
                  <span className="text-sm font-medium text-orange-600">Yes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueDetail
