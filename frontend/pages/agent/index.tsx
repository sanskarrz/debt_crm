import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

interface Allocation {
  id: string
  debtorName: string
  phoneNumber: string
  amountDue: number
  status: string
}

export default function AgentDashboard() {
  const [currentAllocation, setCurrentAllocation] = useState<Allocation | null>(null)
  const [agentStatus, setAgentStatus] = useState('offline')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }
  }, [router])

  const handleStatusChange = (status: string) => {
    setAgentStatus(status)
    // Update agent status via API
  }

  const handleCallNext = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/allocations/next/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const allocation = await response.json()
        setCurrentAllocation(allocation)
      }
    } catch (error) {
      console.error('Error getting next allocation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <>
      <Head>
        <title>Agent Dashboard - Debt Recovery CRM</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Agent Status Controls */}
            <div className="card mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Agent Status</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleStatusChange('ready')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    agentStatus === 'ready'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Ready
                </button>
                <button
                  onClick={() => handleStatusChange('wrap')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    agentStatus === 'wrap'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Wrap
                </button>
                <button
                  onClick={() => handleStatusChange('break')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    agentStatus === 'break'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Break
                </button>
                <button
                  onClick={() => handleStatusChange('offline')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    agentStatus === 'offline'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>

            {/* Call Controls */}
            <div className="card mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Call Controls</h2>
              <div className="flex space-x-4">
                <button
                  onClick={handleCallNext}
                  disabled={loading || agentStatus !== 'ready'}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Call Next'}
                </button>
                <button
                  disabled={!currentAllocation}
                  className="btn-secondary disabled:opacity-50"
                >
                  End Call
                </button>
              </div>
            </div>

            {/* Current Call */}
            {currentAllocation && (
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Current Call</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Debtor Name</label>
                    <p className="mt-1 text-sm text-gray-900">{currentAllocation.debtorName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{currentAllocation.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount Due</label>
                    <p className="mt-1 text-sm text-gray-900">₹{currentAllocation.amountDue.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900">{currentAllocation.status}</p>
                  </div>
                </div>

                {/* Disposition Form */}
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Call Disposition</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200">
                      PTP
                    </button>
                    <button className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200">
                      RTP
                    </button>
                    <button className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200">
                      NTP
                    </button>
                    <button className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200">
                      Callback
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200">
                      DNC
                    </button>
                    <button className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium hover:bg-purple-200">
                      Wrong Number
                    </button>
                    <button className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium hover:bg-orange-200">
                      No Answer
                    </button>
                    <button className="px-3 py-2 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-medium hover:bg-indigo-200">
                      Other
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

