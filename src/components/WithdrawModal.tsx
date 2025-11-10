import React, { useState } from 'react';
import { X, Banknote, Shield, Clock, CheckCircle, Copy, AlertTriangle } from 'lucide-react';
import { KYCStatus } from '../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number) => void;
  balance: number;
  kycStatus?: KYCStatus;
  onOpenKYC?: () => void;
}

interface WithdrawFormData {
  amount: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random';
  fullName: string;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onWithdraw,
  balance,
  kycStatus,
  onOpenKYC
}) => {
  const [formData, setFormData] = useState<WithdrawFormData>({
    amount: '',
    pixKey: '',
    pixKeyType: 'cpf',
    fullName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const minWithdraw = 40;
  const maxWithdraw = balance;

  if (!isOpen) return null;

  const requiresKYC = balance >= 40;
  const isKYCVerified = kycStatus?.isVerified || false;
  const needsKYCVerification = requiresKYC && !isKYCVerified;

  const handleOpenKYCModal = () => {
    onClose();
    if (onOpenKYC) {
      onOpenKYC();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const amount = parseFloat(formData.amount.replace(',', '.'));

    if (!formData.amount) newErrors.amount = 'Valor é obrigatório';
    if (amount < minWithdraw) newErrors.amount = `Valor mínimo R$ ${minWithdraw.toFixed(2).replace('.', ',')}`;
    if (amount > maxWithdraw) newErrors.amount = `Valor máximo R$ ${maxWithdraw.toFixed(2).replace('.', ',')}`;
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório';
    if (!formData.pixKey.trim()) newErrors.pixKey = 'Chave PIX é obrigatória';

    // Validações específicas por tipo de chave
    if (formData.pixKeyType === 'cpf' && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.pixKey)) {
      newErrors.pixKey = 'CPF inválido (000.000.000-00)';
    }
    if (formData.pixKeyType === 'email' && !/\S+@\S+\.\S+/.test(formData.pixKey)) {
      newErrors.pixKey = 'Email inválido';
    }
    if (formData.pixKeyType === 'phone' && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.pixKey)) {
      newErrors.pixKey = 'Telefone inválido (11) 99999-9999';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowSuccess(true);
    setIsSubmitting(false);
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = (parseFloat(numbers) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatted === '0,00' ? '' : formatted;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePixKeyChange = (value: string) => {
    let formatted = value;
    
    if (formData.pixKeyType === 'cpf') {
      formatted = formatCPF(value);
    } else if (formData.pixKeyType === 'phone') {
      formatted = formatPhone(value);
    }
    
    setFormData({...formData, pixKey: formatted});
  };

  const getPixKeyPlaceholder = () => {
    switch (formData.pixKeyType) {
      case 'cpf': return '000.000.000-00';
      case 'email': return 'seu@email.com';
      case 'phone': return '(11) 99999-9999';
      case 'random': return 'Chave aleatória (32 caracteres)';
      default: return '';
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onWithdraw(parseFloat(formData.amount.replace(',', '.')));
    setFormData({
      amount: '',
      pixKey: '',
      pixKeyType: 'cpf',
      fullName: ''
    });
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-4 max-h-[95vh] flex flex-col">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Saque Solicitado com Sucesso!</h2>
              <p className="text-white/90 text-sm">Sua solicitacao foi recebida</p>
            </div>
          </div>

          <div className="p-6 text-center flex-1 overflow-y-auto">
            <div className="bg-green-50 rounded-2xl p-5 mb-4 border-2 border-green-200">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Banknote className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-3">
                Valor Solicitado
              </h3>
              <div className="bg-white rounded-xl p-4 border border-green-300 shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  R$ {formData.amount}
                </div>
                <div className="flex items-center justify-center gap-2 text-green-700 mb-3">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm font-semibold">
                    Processamento em ate 2 dias uteis
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-green-800 text-xs font-medium mb-1">
                    Chave PIX: {formData.pixKey}
                  </p>
                  <p className="text-green-700 text-xs">
                    {formData.fullName}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-bold text-blue-800 mb-2 text-sm">Proximos Passos</h4>
                  <ul className="text-blue-700 text-xs space-y-1.5 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Seu saque esta em processamento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>O valor sera transferido para sua chave PIX</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Prazo: ate 2 dias uteis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Voce recebera uma notificacao quando o saque for concluido</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseSuccess}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 active:scale-95 shadow-lg text-base"
              style={{ touchAction: 'manipulation' }}
            >
              Entendi, Fechar
            </button>

            <p className="text-gray-500 text-xs mt-3">
              Voce pode continuar usando a plataforma normalmente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-emerald-500 p-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Banknote className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sacar Saldo</h2>
                <p className="text-white/80 text-sm">R$ {balance.toFixed(2).replace('.', ',')} disponível</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Aviso de KYC não verificado (só aparece se tiver saldo >= 40) */}
          {needsKYCVerification && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-bold text-sm">Verificacao Necessaria</span>
              </div>
              <p className="text-yellow-700 text-sm mb-3 leading-relaxed">
                A verificacao KYC confirma o titular da conta e libera as funções financeiras, como saque e deposito. É uma medida de segurança obrigatoria
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 mb-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700 text-xs leading-relaxed">
                    Apos verificacao voce podera sacar todo o seu saldo disponivel
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenKYCModal}
                className="w-full bg-yellow-500 text-white font-bold py-3 rounded-xl hover:bg-yellow-600 transition-all duration-300 active:scale-95"
                style={{ touchAction: 'manipulation' }}
              >
                Verificar Conta Agora
              </button>
            </div>
          )}

          {/* Aviso se saldo insuficiente */}
          {!needsKYCVerification && balance < minWithdraw && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-bold text-sm">Saldo Insuficiente</span>
              </div>
              <p className="text-red-700 text-sm">
                Você precisa de pelo menos R$ 40,00 para sacar.
                Faltam R$ {(minWithdraw - balance).toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}

          {!needsKYCVerification && (
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Valor do Saque */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Valor do Saque
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                  R$
                </span>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => {
                    const formatted = formatCurrency(e.target.value);
                    setFormData({...formData, amount: formatted});
                  }}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none text-xl font-bold text-center transition-colors text-gray-800 ${
                    errors.amount ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                  }`}
                  placeholder="0,00"
                  inputMode="numeric"
                  min="40"
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              
              {/* Valores sugeridos */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[40, Math.min(100, balance), balance].filter((val, index, arr) => val >= 40 && arr.indexOf(val) === index).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({...formData, amount: value.toFixed(2).replace('.', ',')})}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-3 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 transition-all duration-200 active:scale-95 shadow-sm"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <div className="text-base font-bold text-emerald-700">
                      R$ {value.toFixed(2).replace('.', ',')}
                    </div>
                    {value === balance && (
                      <div className="text-xs text-emerald-600 mt-1">Saldo total</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Nome Completo */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-800 ${
                  errors.fullName ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                }`}
                placeholder="Seu nome completo"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Tipo de Chave PIX */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Tipo de Chave PIX
              </label>
              <select
                value={formData.pixKeyType}
                onChange={(e) => setFormData({...formData, pixKeyType: e.target.value as any, pixKey: ''})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-gray-800"
              >
                <option value="cpf">CPF</option>
                <option value="email">Email</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave Aleatória</option>
              </select>
            </div>

            {/* Chave PIX */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Chave PIX
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => handlePixKeyChange(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-800 ${
                  errors.pixKey ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                }`}
                placeholder={getPixKeyPlaceholder()}
              />
              {errors.pixKey && <p className="text-red-500 text-xs mt-1">{errors.pixKey}</p>}
            </div>

            {/* Botão de Saque */}
            <button
              type="submit"
              disabled={isSubmitting || balance < minWithdraw}
              className={`w-full font-bold py-4 rounded-2xl transition-all duration-300 active:scale-95 shadow-modern text-lg ${
                balance < minWithdraw
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-emerald-400 text-white cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processando Saque...</span>
                </div>
              ) : balance < minWithdraw ? (
                <div className="flex items-center justify-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Saldo Insuficiente (Mín. R$ 40,00)</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Banknote className="w-5 h-5" />
                  <span>CONFIRMAR SAQUE</span>
                </div>
              )}
            </button>
          </form>
          )}

          {/* Informações de Segurança */}
          {!needsKYCVerification && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-blue-800 mb-1 text-sm">Segurança</h4>
                <ul className="text-blue-700 text-xs space-y-1">
                  <li>• Valor mínimo: R$ 40,00</li>
                  <li>• Processamento: até 2 dias úteis</li>
                  <li>• Dados protegidos e criptografados</li>
                  <li>• Sem taxas via PIX</li>
                </ul>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};