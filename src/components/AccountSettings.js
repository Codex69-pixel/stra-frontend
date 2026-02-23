import React, { useState } from "react";
import apiService from "../services/api";

export default function AccountSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await apiService.changePassword({ currentPassword, newPassword });
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await apiService.forgotPassword({ email });
      setMessage("Reset link sent to your email.");
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await apiService.resetPassword({ token: resetToken, newPassword });
      setMessage("Password reset successfully.");
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>
      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="border rounded px-3 py-2 w-full" />
        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="border rounded px-3 py-2 w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Change Password</button>
      </form>
      {/* Forgot Password */}
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <h2 className="text-lg font-semibold">Forgot Password</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2 w-full" />
        <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded">Send Reset Link</button>
      </form>
      {/* Reset Password */}
      <form onSubmit={handleResetPassword} className="space-y-4">
        <h2 className="text-lg font-semibold">Reset Password</h2>
        <input type="text" placeholder="Reset Token" value={resetToken} onChange={e => setResetToken(e.target.value)} className="border rounded px-3 py-2 w-full" />
        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="border rounded px-3 py-2 w-full" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Reset Password</button>
      </form>
      {/* Feedback */}
      {loading && <div className="text-blue-600">Processing...</div>}
      {message && <div className="text-green-600">{message}</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
