import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Settings: React.FC = () => {
  const { currentUser, updateUser, logout } = useApp();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskUpdates: true,
    dueDateReminders: true,
    weeklyReports: false
  });
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC-5'
  });

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setSaveError('');
    setSaving(true);
    try {
      const result = await updateUser(currentUser.id, {
        name: formData.name,
        email: formData.email
      });
      if (result?.ok === false) {
        setSaveError(result.message || 'Failed to update profile');
        return;
      }
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (formData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    try {
      const res = await (await import('../services/api')).apiService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      if (!res.success) {
        alert(res.message || 'Failed to change password');
        return;
      }
      alert('Password updated successfully!');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (e: any) {
      alert(e.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
        <p className="text-gray-200">Manage your account preferences and settings</p>
      </div>

      {/* Profile Settings */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl border border-indigo-500/30">
            <User className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your name"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                disabled={!isEditing}
              />
            </div>
          </div>

          {saveError && (
            <p className="text-red-400 text-sm">{saveError}</p>
          )}
          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pr-10"
                  placeholder="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="New password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePasswordChange} disabled={!formData.newPassword || !formData.confirmPassword}>
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
            <Bell className="w-6 h-6 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-800/30 transition-all duration-200">
              <div>
                <span className="text-sm font-medium text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <p className="text-xs text-gray-400">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'taskUpdates' && 'Get notified when tasks are updated'}
                  {key === 'dueDateReminders' && 'Receive reminders for upcoming due dates'}
                  {key === 'weeklyReports' && 'Get weekly project summary reports'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
            <Palette className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Appearance</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Theme</label>
              <select
                value={appearance.theme}
                onChange={(e) => setAppearance(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Language</label>
              <select
                value={appearance.language}
                onChange={(e) => setAppearance(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Timezone</label>
              <select
                value={appearance.timezone}
                onChange={(e) => setAppearance(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="UTC-8">Pacific Time (UTC-8)</option>
                <option value="UTC-7">Mountain Time (UTC-7)</option>
                <option value="UTC-6">Central Time (UTC-6)</option>
                <option value="UTC-5">Eastern Time (UTC-5)</option>
                <option value="UTC+0">UTC</option>
                <option value="UTC+1">Central European Time (UTC+1)</option>
                <option value="UTC+5:30">India Standard Time (UTC+5:30)</option>
                <option value="UTC+8">China Standard Time (UTC+8)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-2xl p-6 border border-red-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-slate-800/30 transition-all duration-200">
            <div>
              <span className="text-sm font-medium text-red-400">Sign Out</span>
              <p className="text-xs text-red-300">Sign out of your current session</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};