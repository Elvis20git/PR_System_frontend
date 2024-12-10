import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../../src/components/layout/Sidebar.tsx';
import Navbar from '../../../src/components/layout/Navbar.tsx';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_HOD: boolean;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/profile/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name,
        last_name: response.data.last_name
      });
    } catch (err) {
      setError('Failed to fetch profile');
      return Promise.reject(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8000/api/profile/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      fetchProfile(); // Refresh profile data
      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError('Failed to update profile');
      return Promise.reject(err);
    }
  };

  if (!profile) {
    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Profile...</p>
      </div>
    </div>
  );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-semibold mb-6">Profile</h2>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <p className="text-green-700">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Read-only fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="mt-1 bg-gray-50 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="mt-1 bg-gray-50 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>

                  {/* Editable fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                        isEditing ? 'bg-white focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                        isEditing ? 'bg-white focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      value={profile.is_HOD ? 'Head of Department' : 'Staff'}
                      disabled
                      className="mt-1 bg-gray-50 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              first_name: profile.first_name,
                              last_name: profile.last_name,
                            });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save Changes
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;