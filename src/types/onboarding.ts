export interface OnboardingStepProps {
  /** Ausente na etapa 1. */
  onBack?: () => void;
  /** Chamado depois de gravar com sucesso (ou de pular, quando permitido). */
  onDone: () => void;
  /** Só nas etapas que podem ser puladas. */
  onSkip?: () => void;
}
