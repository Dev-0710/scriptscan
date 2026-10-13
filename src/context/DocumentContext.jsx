import { createContext, useState, useContext } from 'react';

const DocumentContext = createContext();

const base = import.meta.env.BASE_URL;

const mockDocuments = [
  { id: 1, filename: "Folio_MS_1402_Deed.tiff", collection: "Historical Folio", date: "Oct 24, 2024", lines: 42, confidence: 94.2, status: "Completed", image: `${base}doc_folio_1402.png` },
  { id: 2, filename: "Lab_Notes_DrAris_Vol3.pdf", collection: "Cursive Notes", date: "Oct 23, 2024", lines: 118, confidence: 68.4, status: "Needs Review", image: `${base}doc_lab_notes.png` },
  { id: 3, filename: "Archival_Letter_1884.png", collection: "Correspondence", date: "Oct 22, 2024", lines: 28, confidence: 98.1, status: "Completed", image: `${base}doc_archival_letter.png` }
];

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState(mockDocuments);
  const [activeDocumentId, setActiveDocumentId] = useState(mockDocuments[0].id);
  const [pipelineParams, setPipelineParams] = useState({
    model: "CNN-BiLSTM-CTC",
    beamWidth: 16,
    languageModel: "Middle-English"
  });

  const activeDocument = documents.find(d => d.id === activeDocumentId);

  return (
    <DocumentContext.Provider value={{
      documents, 
      setDocuments,
      activeDocumentId, 
      setActiveDocumentId, 
      activeDocument,
      pipelineParams,
      setPipelineParams
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  return useContext(DocumentContext);
}
