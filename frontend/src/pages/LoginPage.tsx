import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Scale, Lock, User, Mail, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: 'lead_investigator',
    password: 'password123',
    name: 'Adv. Vikramaditya Sharma',
    email: 'investigator@caselyt.law',
    role: 'Senior Criminal Defense & Evidence Architect'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        await apiService.register({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          role: formData.role
        });
        setSuccessMsg('Counsel identity registered successfully. Authenticating session...');
      } else {
        await apiService.login(formData.username, formData.password);
        setSuccessMsg('Access granted. Entering evidence vault...');
      }

      setTimeout(() => {
        navigate('/');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleKey: 'defense' | 'prosecution' | 'forensics') => {
    setError(null);
    if (roleKey === 'defense') {
      setFormData({
        username: 'lead_investigator',
        password: 'password123',
        name: 'Adv. Vikramaditya Sharma',
        email: 'vikramaditya@caselyt.law',
        role: 'Senior Criminal Defense & Evidence Architect'
      });
    } else if (roleKey === 'prosecution') {
      setFormData({
        username: 'special_prosecutor',
        password: 'password123',
        name: 'Adv. Ananya Deshmukh',
        email: 'ananya.deshmukh@caselyt.law',
        role: 'Special Public Prosecutor (CBI / Financial Crimes)'
      });
    } else {
      setFormData({
        username: 'forensic_auditor',
        password: 'password123',
        name: 'Dr. Rajesh Nair, CFE',
        email: 'rajesh.nair@forensicaudit.law',
        role: 'Chief Forensic Accountant & Graph Analyst'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0E7] text-[#171717] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Subtle Watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <Scale className="w-[800px] h-[800px] text-[#6C2029]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="p-3 bg-[#6C2029] rounded-lg shadow-md text-[#F4F0E7] border border-[#8C2A36]">
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#171717]">
              CASELYT <span className="text-[#AD8748] text-xl font-sans tracking-widest font-semibold ml-1">2.0</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-stone-500 font-mono">
              Agentic Legal Evidence Intelligence
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-center font-serif text-2xl font-semibold tracking-tight text-[#171717]">
          {isRegister ? 'Register Counsel Credentials' : 'Sign in to Case Vault'}
        </h2>
        <p className="mt-1 text-center text-xs text-stone-600 font-serif italic">
          Secure, verified, and document-grounded legal workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#FAF7F2] py-8 px-6 shadow-xl rounded-xl border border-[#D1C7BD] sm:px-10">
          {/* Quick Demo Access Pills */}
          <div className="mb-6 pb-5 border-b border-[#E5DFD5]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#AD8748]" /> Fast Demo Identities
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('defense')}
                className="text-[11px] font-sans font-medium py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-800 rounded border border-stone-300 hover:border-[#6C2029] transition-all shadow-xs text-center"
              >
                Defense
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('prosecution')}
                className="text-[11px] font-sans font-medium py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-800 rounded border border-stone-300 hover:border-[#6C2029] transition-all shadow-xs text-center"
              >
                Prosecution
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('forensics')}
                className="text-[11px] font-sans font-medium py-1.5 px-2 bg-white hover:bg-stone-50 text-stone-800 rounded border border-stone-300 hover:border-[#6C2029] transition-all shadow-xs text-center"
              >
                Forensic
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50/90 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative rounded-md shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Adv. Vikramaditya Sharma"
                      className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D1C7BD] rounded-md text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#6C2029] focus:border-[#6C2029]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior Defense Counsel"
                    className="block w-full px-3 py-2 text-sm bg-white border border-[#D1C7BD] rounded-md text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#6C2029] focus:border-[#6C2029]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono mb-1">
                    Official Email
                  </label>
                  <div className="relative rounded-md shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="counsel@caselyt.law"
                      className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D1C7BD] rounded-md text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#6C2029] focus:border-[#6C2029]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono mb-1">
                Username / Identifier
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D1C7BD] rounded-md text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#6C2029] focus:border-[#6C2029]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono mb-1">
                Security Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D1C7BD] rounded-md text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#6C2029] focus:border-[#6C2029]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-[#8C2A36] rounded-md shadow-sm text-sm font-medium text-white bg-[#6C2029] hover:bg-[#581a21] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C2029] disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>{isRegister ? 'Register & Enter Workspace' : 'Authorize & Enter Vault'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-sans font-medium text-[#6C2029] hover:text-[#581a21] hover:underline"
            >
              {isRegister
                ? 'Already have an authorized counsel ID? Sign In'
                : 'Need to register a new Counsel / Investigator Profile? Click here'}
            </button>
          </div>
        </div>

        {/* Security & Verification Banner */}
        <div className="mt-6 text-center text-[11px] font-mono text-stone-500 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>End-to-End Grounded Verification Gate Active • 256-bit Document Vault</span>
        </div>
      </div>
    </div>
  );
};
