export function buildAgreementDefaults({ name, email, phone } = {}) {
  return {
    astroSignatory1Name: 'MUHAMMAD MUZAMIL BIN HUSSIN', astroSignatory1Email: 'mell_hussin@kult.my',
    counterparty1Name: name || '', counterparty1Phone: phone || '', counterparty1Email: email || '', counterparty1Nric: '',
    ccRepName: '', ccRepEmail: '',
    signingOrderRequired: 'No', signingOrderSequence: '',
    cesBoardRequired: 'No',
    costCentre: 'A300DH006', contractAmount: 'RM0',
    stampDutyParty: 'Astro',
    specialRequests: 'Auto-reminder',
  }
}
