import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

interface SipTrunk {
  id: string
  name: string
  provider: string
  host: string
  port: number
  username: string
  password: string
  callerId: string
  isActive: boolean
}

interface GsmGateway {
  id: string
  name: string
  gatewayHost: string
  gatewayPort: number
  username: string
  password: string
  channelCount: number
  isActive: boolean
}

interface User {
  id: string
  username: string
  email: string
  role: string
  firstName: string
  lastName: string
  isActive: boolean
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('sip-trunk')
  const [sipTrunks, setSipTrunks] = useState<SipTrunk[]>([])
  const [gsmGateways, setGsmGateways] = useState<GsmGateway[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showSipForm, setShowSipForm] = useState(false)
  const [showGsmForm, setShowGsmForm] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const router = useRouter()

  const [sipForm, setSipForm] = useState({
    name: '',
    provider: '',
    host: '',
    port: 5060,
    username: '',
    password: '',
    callerId: ''
  })

  const [gsmForm, setGsmForm] = useState({
    name: '',
    gatewayHost: '',
    gatewayPort: 5060,
    username: '',
    password: '',
    channelCount: 1
  })

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'agent',
    firstName: '',
    lastName: '',
    phone: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    fetchSipTrunks()
    fetchGsmGateways()
    fetchUsers()
  }, [router])

  const fetchSipTrunks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sip-routes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSipTrunks(data)
      }
    } catch (error) {
      console.error('Error fetching SIP trunks:', error)
    }
  }

  const fetchGsmGateways = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gsm-routes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setGsmGateways(data)
      }
    } catch (error) {
      console.error('Error fetching GSM gateways:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sip-routes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sipForm)
      })
      
      if (response.ok) {
        setShowSipForm(false)
        setSipForm({ name: '', provider: '', host: '', port: 5060, username: '', password: '', callerId: '' })
        fetchSipTrunks()
      }
    } catch (error) {
      console.error('Error creating SIP trunk:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGsmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gsm-routes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gsmForm)
      })
      
      if (response.ok) {
        setShowGsmForm(false)
        setGsmForm({ name: '', gatewayHost: '', gatewayPort: 5060, username: '', password: '', channelCount: 1 })
        fetchGsmGateways()
      }
    } catch (error) {
      console.error('Error creating GSM gateway:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userForm)
      })
      
      if (response.ok) {
        setShowUserForm(false)
        setUserForm({ username: '', email: '', password: '', role: 'agent', firstName: '', lastName: '', phone: '' })
        fetchUsers()
      }
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setLoading(false)
    }
  }

  const testSipConnection = async (sipId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sip-routes/${sipId}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        alert('SIP connection test successful!')
      } else {
        alert('SIP connection test failed!')
      }
    } catch (error) {
      alert('SIP connection test failed!')
    }
  }

  const testGsmConnection = async (gsmId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gsm-routes/${gsmId}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        alert('GSM gateway connection test successful!')
      } else {
        alert('GSM gateway connection test failed!')
      }
    } catch (error) {
      alert('GSM gateway connection test failed!')
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
        <title>Admin Dashboard - Debt Recovery CRM</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'sip-trunk', name: 'SIP Trunk Configuration' },
                { id: 'gsm-gateway', name: 'GSM Gateway Setup' },
                { id: 'users', name: 'User Management' },
                { id: 'guide', name: 'Connection Guide' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            
            {/* SIP Trunk Configuration */}
            {activeTab === 'sip-trunk' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">SIP Trunk Configuration</h2>
                  <button
                    onClick={() => setShowSipForm(true)}
                    className="btn-primary"
                  >
                    Add SIP Trunk
                  </button>
                </div>

                {showSipForm && (
                  <div className="card">
                    <h3 className="text-lg font-medium mb-4">Add New SIP Trunk</h3>
                    <form onSubmit={handleSipSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            value={sipForm.name}
                            onChange={(e) => setSipForm({...sipForm, name: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Provider</label>
                          <input
                            type="text"
                            value={sipForm.provider}
                            onChange={(e) => setSipForm({...sipForm, provider: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Host</label>
                          <input
                            type="text"
                            value={sipForm.host}
                            onChange={(e) => setSipForm({...sipForm, host: e.target.value})}
                            className="input-field"
                            placeholder="sip.provider.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Port</label>
                          <input
                            type="number"
                            value={sipForm.port}
                            onChange={(e) => setSipForm({...sipForm, port: parseInt(e.target.value)})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Username</label>
                          <input
                            type="text"
                            value={sipForm.username}
                            onChange={(e) => setSipForm({...sipForm, username: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Password</label>
                          <input
                            type="password"
                            value={sipForm.password}
                            onChange={(e) => setSipForm({...sipForm, password: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Caller ID</label>
                          <input
                            type="text"
                            value={sipForm.callerId}
                            onChange={(e) => setSipForm({...sipForm, callerId: e.target.value})}
                            className="input-field"
                            placeholder="1401234567"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button type="submit" disabled={loading} className="btn-primary">
                          {loading ? 'Creating...' : 'Create SIP Trunk'}
                        </button>
                        <button type="button" onClick={() => setShowSipForm(false)} className="btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sipTrunks.map((trunk) => (
                          <tr key={trunk.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {trunk.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trunk.provider}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {trunk.host}:{trunk.port}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                trunk.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {trunk.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => testSipConnection(trunk.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Test
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* GSM Gateway Configuration */}
            {activeTab === 'gsm-gateway' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">GSM Gateway Configuration</h2>
                  <button
                    onClick={() => setShowGsmForm(true)}
                    className="btn-primary"
                  >
                    Add GSM Gateway
                  </button>
                </div>

                {showGsmForm && (
                  <div className="card">
                    <h3 className="text-lg font-medium mb-4">Add New GSM Gateway</h3>
                    <form onSubmit={handleGsmSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            value={gsmForm.name}
                            onChange={(e) => setGsmForm({...gsmForm, name: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gateway Host</label>
                          <input
                            type="text"
                            value={gsmForm.gatewayHost}
                            onChange={(e) => setGsmForm({...gsmForm, gatewayHost: e.target.value})}
                            className="input-field"
                            placeholder="192.168.1.100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gateway Port</label>
                          <input
                            type="number"
                            value={gsmForm.gatewayPort}
                            onChange={(e) => setGsmForm({...gsmForm, gatewayPort: parseInt(e.target.value)})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Username</label>
                          <input
                            type="text"
                            value={gsmForm.username}
                            onChange={(e) => setGsmForm({...gsmForm, username: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Password</label>
                          <input
                            type="password"
                            value={gsmForm.password}
                            onChange={(e) => setGsmForm({...gsmForm, password: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Channel Count</label>
                          <input
                            type="number"
                            value={gsmForm.channelCount}
                            onChange={(e) => setGsmForm({...gsmForm, channelCount: parseInt(e.target.value)})}
                            className="input-field"
                            min="1"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button type="submit" disabled={loading} className="btn-primary">
                          {loading ? 'Creating...' : 'Create GSM Gateway'}
                        </button>
                        <button type="button" onClick={() => setShowGsmForm(false)} className="btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gateway Host</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channels</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {gsmGateways.map((gateway) => (
                          <tr key={gateway.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {gateway.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {gateway.gatewayHost}:{gateway.gatewayPort}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {gateway.channelCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                gateway.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {gateway.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => testGsmConnection(gateway.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Test
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* User Management */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <button
                    onClick={() => setShowUserForm(true)}
                    className="btn-primary"
                  >
                    Add User
                  </button>
                </div>

                {showUserForm && (
                  <div className="card">
                    <h3 className="text-lg font-medium mb-4">Add New User</h3>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Username</label>
                          <input
                            type="text"
                            value={userForm.username}
                            onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            value={userForm.email}
                            onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Password</label>
                          <input
                            type="password"
                            value={userForm.password}
                            onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Role</label>
                          <select
                            value={userForm.role}
                            onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                            className="input-field"
                            required
                          >
                            <option value="agent">Agent</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">First Name</label>
                          <input
                            type="text"
                            value={userForm.firstName}
                            onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Name</label>
                          <input
                            type="text"
                            value={userForm.lastName}
                            onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <input
                            type="text"
                            value={userForm.phone}
                            onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button type="submit" disabled={loading} className="btn-primary">
                          {loading ? 'Creating...' : 'Create User'}
                        </button>
                        <button type="button" onClick={() => setShowUserForm(false)} className="btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="card">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button className="text-green-600 hover:text-green-900">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Connection Guide */}
            {activeTab === 'guide' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Connection Guide</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* SIP Trunk Guide */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">SIP Trunk Setup Guide</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700">1. Get SIP Trunk Credentials</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Contact your telecom provider (Airtel, Tata, Vi) to get:
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                          <li>SIP server hostname/IP</li>
                          <li>Port number (usually 5060)</li>
                          <li>Username and password</li>
                          <li>Caller ID (must be registered with TRAI)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700">2. Configure in System</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Use the SIP Trunk Configuration tab to add your provider details.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700">3. Test Connection</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Use the "Test" button to verify connectivity before going live.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* GSM Gateway Guide */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">GSM Gateway Setup Guide</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700">1. Hardware Setup</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Connect your GSM gateway (GoIP, Dinstar, etc.) to your network:
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                          <li>Connect to power and network</li>
                          <li>Insert SIM cards in all channels</li>
                          <li>Note the gateway IP address</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700">2. Gateway Configuration</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Access gateway web interface and configure:
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                          <li>SIP server: Your Asterisk IP</li>
                          <li>SIP port: 5060</li>
                          <li>Username/Password for authentication</li>
                          <li>Enable all channels</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700">3. System Integration</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Add gateway details in the GSM Gateway Configuration tab.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Network Requirements */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700">Firewall Ports</h4>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• 5060 UDP/TCP - SIP signaling</li>
                        <li>• 10000-20000 UDP - RTP media</li>
                        <li>• 8088 TCP - Asterisk ARI</li>
                        <li>• 3000-3002 TCP - Application ports</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Bandwidth Requirements</h4>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• 100 Kbps per concurrent call</li>
                        <li>• Minimum 10 Mbps for 100 agents</li>
                        <li>• Low latency connection preferred</li>
                        <li>• Stable internet connection required</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700">SIP Connection Issues</h4>
                      <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                        <li>Check firewall settings</li>
                        <li>Verify credentials with provider</li>
                        <li>Test with different codecs (ulaw/alaw)</li>
                        <li>Check NAT configuration</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700">GSM Gateway Issues</h4>
                      <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                        <li>Verify SIM card activation</li>
                        <li>Check signal strength</li>
                        <li>Test individual channels</li>
                        <li>Verify gateway registration</li>
                      </ul>
                    </div>
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

