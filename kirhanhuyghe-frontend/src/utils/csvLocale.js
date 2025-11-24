// src/utils/csvLocale.js

export const nlCSV = {
  general: {
    goToPreviousStep: 'Vorige',
    goToNextStep: 'Volgende',
  },
  fileStep: {
    initialDragDropPrompt: 'Sleep het CSV bestand hierheen of klik om te selecteren',
    activeDragDropPrompt: 'Laat het bestand hier los...',
    getImportError: (errMsg) => `Fout bij importeren: ${errMsg}`,
    getDataFormatError: () => 'Controleer of het bestand het juiste formaat heeft',
    goBackButton: 'Terug',
    nextButton: 'Volgende',
    rawFileContents: 'Ruwe bestandsinhoud',
    previewImportData: 'Voorbeeld import data',
    changeFile: 'Wijzig bestand',
    hasHeaders: 'Bevat kopteksten',
    loadingPreview: 'Voorbeeld laden...',
  },
  fieldsStep: {
    stepTitle: 'Kolommen toewijzen',
    dragSource: 'Kolom uit CSV',
    dropTarget: 'Veld in Database',
    columnTooltip: 'Sleep de kolom naar het juiste veld',
    nextButton: 'Importeren',
    backButton: 'Terug',
    getColumnCardHeader: (code) => `Kolom: ${code}`,
    getDragTargetRequiredCaption: () => 'Verplicht',
    getDragTargetOptionalCaption: () => 'Optioneel',
    getDragTargetRemoveTooltip: () => 'Verwijder toewijzing',
    
    // 👇 DEZE WAREN GEMIST EN ZIJN NU TOEGEVOEGD:
    getDragSourcePageIndicator: (currentPage, pageCount) => `Pagina ${currentPage} van ${pageCount}`,
    getDragSourceNextPageTitle: (nextPage) => `Ga naar pagina ${nextPage}`,
    getDragSourcePreviousPageTitle: (previousPage) => `Ga naar pagina ${previousPage}`,
    getDragSourceReset: () => 'Reset',
    getDragSourceSelectAll: () => 'Alles selecteren',
    getDragSourceLoadMore: () => 'Laad meer...', 
  },
  progressStep: {
    stepTitle: 'Bezig met importeren...',
    nextButton: 'Klaar',
    status: {
      uploading: 'Uploaden...',
      processing: 'Verwerken...',
      complete: 'Voltooid!',
    },
  },
};