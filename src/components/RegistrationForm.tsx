import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  Gift,
  Clock,
  Mail,
  User as UserIcon,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface RegistrationFormProps {
  onRegister: (user: User) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
  const [timeLeft, setTimeLeft] = useState(900);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerUrgency = () => {
    if (timeLeft <= 180) return 'critical';
    if (timeLeft <= 300) return 'high';
    return 'low';
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Nome é obrigatório';
        } else if (value.trim().length < 3) {
          newErrors.name = 'Nome muito curto';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
          newErrors.name = 'Apenas letras';
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email inválido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value.trim()) {
          newErrors.password = 'Senha é obrigatória';
        } else if (value.length < 6) {
          newErrors.password = 'Mínimo 6 caracteres';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
    setFocusedField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched = { name: true, email: true, password: true };
    setTouched(allTouched);

    validateField('name', formData.name);
    validateField('email', formData.email);
    validateField('password', formData.password);

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 3 || !/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.name)) {
      newErrors.name = formData.name.trim() ? (formData.name.trim().length < 3 ? 'Nome muito curto' : 'Apenas letras') : 'Nome é obrigatório';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = formData.email.trim() ? 'Email inválido' : 'Email é obrigatório';
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      newErrors.password = formData.password.trim() ? 'Mínimo 6 caracteres' : 'Senha é obrigatória';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const user: User = {
      id: `user_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      registeredAt: new Date()
    };

    setShowSuccess(true);

    setTimeout(() => {
      onRegister(user);
    }, 1800);

    setIsSubmitting(false);
  };

  const timerUrgency = getTimerUrgency();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-sm relative z-10">
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-accent to-accent-hover rounded-2xl p-6 text-center animate-scale-in border border-white/30 shadow-2xl max-w-xs w-full">
              <CheckCircle className="w-16 h-16 text-white mx-auto mb-3 animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-2">Cadastro realizado!</h2>

              <div className="bg-white/20 rounded-lg p-3 mb-3">
                <div className="text-white/80 text-xs mb-0.5">Seu bonus</div>
                <div className="text-3xl font-bold text-white">R$ 14,70</div>
              </div>

              <p className="text-white/80 text-xs flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Preparando sua conta...
              </p>
            </div>
          </div>
        )}

        <div className={`bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-800 ${showSuccess ? 'opacity-20' : ''} transition-opacity duration-500`}>
          <div className="p-6 text-center">
            <div className="mb-4">
              <img
                src="/logo_1752328959.png"
                alt="Raspou Ganhou"
                className="h-16 mx-auto mb-3"
              />
            </div>

            <div className="bg-gray-800/50 rounded-xl p-3 mb-4 border border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-accent animate-bounce" />
                <span className="text-white font-bold text-sm">CADASTRE-SE E GANHE</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                R$ 14,70
              </div>
              <div className="text-gray-400 text-xs">
                + 3 Raspadinhas Gratis
              </div>
            </div>

            <div className={`flex items-center justify-center gap-2 text-xs mb-4 p-2 rounded-lg ${
              timerUrgency === 'critical' ? 'bg-red-500/20' : 'bg-gray-800/50'
            }`}>
              <Clock className="w-4 h-4 text-white/80 flex-shrink-0" />
              <span className="text-white/80 font-medium">Expira em:</span>
              <span className={`font-mono font-bold text-white px-2 py-0.5 rounded ${
                timerUrgency === 'critical' ? 'bg-red-500/30 animate-pulse' : 'bg-white/10'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <div className="relative">
                  <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 z-10 ${
                    focusedField === 'name' ? 'text-accent' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => handleFieldBlur('name')}
                    className={`w-full pl-10 pr-10 py-3 bg-gray-800/50 rounded-xl border-2 transition-all duration-300 text-white placeholder-gray-500 focus:outline-none text-sm ${
                      errors.name && touched.name
                        ? 'border-red-500 bg-red-500/10'
                        : focusedField === 'name'
                        ? 'border-accent bg-gray-800'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="Nome completo"
                    autoComplete="name"
                  />
                  {formData.name && !errors.name && touched.name && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                  )}
                </div>
                {errors.name && touched.name && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 z-10 ${
                    focusedField === 'email' ? 'text-accent' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => handleFieldBlur('email')}
                    className={`w-full pl-10 pr-10 py-3 bg-gray-800/50 rounded-xl border-2 transition-all duration-300 text-white placeholder-gray-500 focus:outline-none text-sm ${
                      errors.email && touched.email
                        ? 'border-red-500 bg-red-500/10'
                        : focusedField === 'email'
                        ? 'border-accent bg-gray-800'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="seu@email.com"
                    inputMode="email"
                    autoComplete="email"
                  />
                  {formData.email && !errors.email && touched.email && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                  )}
                </div>
                {errors.email && touched.email && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="relative">
                  <Shield className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 z-10 ${
                    focusedField === 'password' ? 'text-accent' : 'text-gray-400'
                  }`} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => handleFieldBlur('password')}
                    className={`w-full pl-10 pr-10 py-3 bg-gray-800/50 rounded-xl border-2 transition-all duration-300 text-white placeholder-gray-500 focus:outline-none text-sm ${
                      errors.password && touched.password
                        ? 'border-red-500 bg-red-500/10'
                        : focusedField === 'password'
                        ? 'border-accent bg-gray-800'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="Senha (minimo 6 caracteres)"
                    autoComplete="new-password"
                  />
                  {formData.password && !errors.password && touched.password && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                  )}
                </div>
                {errors.password && touched.password && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || timeLeft === 0}
                className="w-full bg-accent text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:bg-accent-hover active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-modern relative overflow-hidden group mt-4"
                style={{ touchAction: 'manipulation' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : timeLeft === 0 ? (
                    <span>Oferta Expirada</span>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      <span>
                        {timerUrgency === 'critical' ? 'GARANTIR AGORA!' : 'RESGATAR SALDO'}
                      </span>
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
              <Shield className="w-3 h-3 flex-shrink-0" />
              <span className="text-center">Dados protegidos com criptografia SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
