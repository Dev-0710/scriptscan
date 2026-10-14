import { createContext, useState, useContext } from 'react';

const DocumentContext = createContext();

const base = import.meta.env.BASE_URL;

const letterADoc = {
  id: 1,
  filename: "Letter_A_Sample.png",
  collection: "Single Letter",
  date: "Oct 14, 2026",
  lines: 1,
  confidence: 96.5,
  status: "Completed",
  image: `${base}letter_a.png`,
  // Segmentation data powering the Workspace view
  segmentationData: {
    image_dimensions: { width: 800, height: 800 },
    lines: [
      {
        line_id: "L01",
        bbox: [200, 180, 400, 440],
        text: "A",
        confidence: 96.5,
        tokens: [
          {
            token_id: "T01_01",
            bbox: [200, 180, 400, 440],
            text: "A",
            confidence: 96.5,
            candidates: ["A", "Λ", "Δ"],
          },
        ],
      },
    ],
  },
};

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([letterADoc]);
  const [activeDocumentId, setActiveDocumentId] = useState(letterADoc.id);
  const [pipelineParams, setPipelineParams] = useState({
    model: "CNN-BiLSTM-CTC",
    beamWidth: 16,
    languageModel: "English",
  });

  const activeDocument = documents.find((d) => d.id === activeDocumentId);

  return (
    <DocumentContext.Provider
      value={{
        documents,
        setDocuments,
        activeDocumentId,
        setActiveDocumentId,
        activeDocument,
        pipelineParams,
        setPipelineParams,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  return useContext(DocumentContext);
}
