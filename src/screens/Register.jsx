import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Eye, EyeOff, ChevronDown } from 'lucide-react';

const BRANCHES = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Agege Jama\'at (Lagos)' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Apata Jama\'at (Ibadan)' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Kano Jama\'at (Kano)' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Ife Jama\'at (Ife, Osun)' },
];

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    branchId: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await register(form);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-2">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-dark">WaqfENau</h1>
          <p className="text-gray text-sm">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-dark mb-1">First Name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Hakeem"
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dark mb-1">Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Babs"
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full h-11 px-3 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dark mb-1">Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dark mb-1">Phone Number</label>
              <input
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="08012345678"
                className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-dark mb-1">Branch</label>
              <div className="relative">
                <select
                  name="branchId"
                  value={form.branchId}
                  onChange={handleChange}
                  className="w-full h-11 px-3 pr-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm appearance-none bg-white"
                  required
                >
                  <option value="">Select your branch</option>
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray pointer-events-none" size={16} />
              </div>
            </div>

            {error && (
              <div className="bg-red/10 text-red text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] bg-primary hover:bg-primary-dark text-white font-semibold rounded-button transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}