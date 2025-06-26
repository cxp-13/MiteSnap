'use client'

import { useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import Image from 'next/image'

interface Duvet {
  id: string
  name: string
  miteRisk: 'Low Risk' | 'Moderate' | 'High'
  mitePercentage: number
  lastCleaned: string
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState<'duvets' | 'orders'>('duvets')
  const [showNewDuvetModal, setShowNewDuvetModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [weather, setWeather] = useState<{ temperature: number; humidity: number } | null>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)

  // Mock duvet data
  const duvets: Duvet[] = [
    {
      id: '1',
      name: 'Master Bedroom Duvet',
      miteRisk: 'Low Risk',
      mitePercentage: 15,
      lastCleaned: '2024-01-20 14:30'
    },
    {
      id: '2',
      name: 'Guest Room Duvet',
      miteRisk: 'Moderate',
      mitePercentage: 45,
      lastCleaned: '2024-01-15 09:15'
    },
    {
      id: '3',
      name: "Children's Room Duvet",
      miteRisk: 'High',
      mitePercentage: 78,
      lastCleaned: '2024-01-10 16:45'
    },
    {
      id: '4',
      name: 'Spare Duvet',
      miteRisk: 'Low Risk',
      mitePercentage: 22,
      lastCleaned: '2024-01-18 11:20'
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return 'text-gray-600'
      case 'Moderate': return 'text-gray-700'
      case 'High': return 'text-black'
      default: return 'text-gray-600'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return '●'
      case 'Moderate': return '●●'
      case 'High': return '●●●'
      default: return '●'
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getWeatherData = async (latitude: number, longitude: number) => {
    setIsLoadingWeather(true)
    try {
      const response = await fetch(`https://api.tomorrow.io/v4/weather/realtime?location=${latitude}%2C${longitude}&apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setWeather({
          temperature: data.data.values.temperature,
          humidity: data.data.values.humidity
        })
      } else {
        console.error('Weather API request failed:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching weather data:', error)
    } finally {
      setIsLoadingWeather(false)
    }
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ latitude, longitude })
          setIsLoadingLocation(false)
          
          // Get weather data for this location
          await getWeatherData(latitude, longitude)
          
          // Optional: Reverse geocoding to get address
          fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`)
            .then(response => response.json())
            .then(data => {
              if (data.results && data.results[0]) {
                setLocation(prev => ({ ...prev!, address: data.results[0].formatted }))
              }
            })
            .catch(() => {
              // Fallback if geocoding fails
              setLocation(prev => ({ ...prev!, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }))
            })
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsLoadingLocation(false)
          alert('Unable to get your location. Please enable location services.')
        }
      )
    } else {
      setIsLoadingLocation(false)
      alert('Geolocation is not supported by this browser.')
    }
  }

  const handleSubmitNewDuvet = () => {
    if (!selectedPhoto) {
      alert('Please upload a photo of your duvet.')
      return
    }
    if (!location) {
      alert('Please get your location.')
      return
    }
    
    // Here you would typically send the data to your backend
    console.log('Submitting new duvet:', {
      photo: selectedPhoto,
      location: location
    })
    
    // Reset form and close modal
    setSelectedPhoto(null)
    setPhotoPreview(null)
    setLocation(null)
    setWeather(null)
    setShowNewDuvetModal(false)
    
    alert('Duvet added successfully!')
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="Acarid Bloom Logo" 
              width={32} 
              height={32}
            />
            <h1 className="text-xl font-semibold">Acarid Bloom</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('duvets')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'duvets'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              My Duvets
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              View Nearby Orders
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="Acarid Bloom Logo" 
                width={24} 
                height={24}
              />
              <span className="text-lg font-semibold text-black">Acarid Bloom</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || 'User'}
              </span>
              <UserButton />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'duvets' && (
              <div className="bg-white">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-black">My Duvets</h2>
                  <button 
                    onClick={() => setShowNewDuvetModal(true)}
                    className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span className="text-lg">+</span>
                    <span>New Duvet</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {duvets.map((duvet) => (
                    <div
                      key={duvet.id}
                      className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-black hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-gray-800">
                            {duvet.name}
                          </h3>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Mite Risk Status</span>
                            <span className={`text-lg ${getRiskColor(duvet.miteRisk)}`}>
                              {getRiskIcon(duvet.miteRisk)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`text-lg font-semibold ${getRiskColor(duvet.miteRisk)}`}>
                              {duvet.miteRisk}
                            </span>
                            <span className="text-sm text-gray-500">
                              {duvet.mitePercentage}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Last Cleaned</p>
                            <p className="text-base text-black">
                              {new Date(duvet.lastCleaned).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(duvet.lastCleaned).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-white">
                <h2 className="text-2xl font-bold text-black mb-6">View Nearby Orders</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Content will be displayed here</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Duvet Modal */}
      {showNewDuvetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">Add New Duvet</h3>
              <button 
                onClick={() => setShowNewDuvetModal(false)}
                className="text-gray-400 hover:text-black text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Photo Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Duvet Photo
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black transition-colors cursor-pointer">
                  {photoPreview ? (
                    <div className="space-y-3">
                      <img 
                        src={photoPreview} 
                        alt="Duvet preview" 
                        className="max-h-40 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">Photo uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-4xl text-gray-400">📷</div>
                      <p className="text-gray-600">Click to upload a photo</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Location Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Get Current Location
                </label>
                <div className="space-y-3">
                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation || isLoadingWeather}
                    className="w-full bg-gray-100 text-black px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isLoadingLocation ? 'Getting Location...' : 
                     isLoadingWeather ? 'Getting Weather...' : 'Get My Location'}
                  </button>
                  {location && (
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <p className="text-sm text-gray-700">
                        📍 Location: {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                      </p>
                      {weather && (
                        <div className="border-t border-gray-200 pt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Current Weather:</p>
                          <div className="flex space-x-4">
                            <span className="text-sm text-gray-600">
                              🌡️ Temperature: {weather.temperature}°C
                            </span>
                            <span className="text-sm text-gray-600">
                              💧 Humidity: {weather.humidity}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitNewDuvet}
                className="w-full bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Add Duvet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}