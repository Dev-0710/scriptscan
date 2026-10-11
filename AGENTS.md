# AGENTS.md

## 1. Project Overview & Role Architecture
**ScriptScan AI** is an end-to-end Handwritten Character Recognition (HCR) web platform designed to ingest raw scanned folios, manuscripts, essays, and lab notebooks, segment them into lines and tokens, and transcribe them into digital text with character-level confidence scores.

The project employs a multi-agent modular workflow where specialized agents handle distinct stages of development, machine learning pipelines, and application orchestration.

---

## 2. Specialized Agent Definitions

### Agent 1: Orchestrator & Systems Architect
- **Mission:** Coordinate end-to-end data contracts, monitor overall pipeline throughput, enforce design tokens, and validate integration across modules.
- **Responsibilities:**
  - Standardize JSON schema between API responses, UI components, and ML inference output[cite: 1, 4].
  - Oversee project state across the 5 core views (`Overview`, `Documents`, `Workspace`, `Batch & Analytics`, `Model Config`).
  - Monitor pipeline telemetry: CER (Character Error Rate), WER (Word Error Rate), and latency budgets (target: $\le 42\text{ ms/line}$).

### Agent 2: Computer Vision & Preprocessing Agent
- **Mission:** Implement reliable document image rectification, binarization, and polygon/bounding-box line and character segmentation[cite: 1, 3].
- **Tech Stack:** OpenCV (`cv4`), NumPy, SciPy.
- **Core Tasks:**
  - Implement adaptive binarization techniques (Otsu thresholding, Sauvola local, and Bradley-Roth)[cite: 3].
  - Perform automatic deskewing using Radon transforms and minimum-area bounding rectangles[cite: 3].
  - Execute contour detection and horizontal/vertical projection profiling to extract line polygons and isolated character bounding boxes[cite: 1, 2, 4].
  - Output standardized $28 \times 28$ or word-strip tensors normalized to $[0.0, 1.0]$.

### Agent 3: Machine Learning & Inference Agent
- **Mission:** Model architecture definition, training, checkpoint management, and decoding.
- **Tech Stack:** PyTorch, Torchvision, ONNX Runtime, KenLM.
- **Core Tasks:**
  - Manage training runs on EMNIST (Balanced / ByMerge) and manuscript datasets.
  - Maintain the ResNet + BiLSTM feature extractor with Connectionist Temporal Classification (CTC) decoders[cite: 1, 3].
  - Implement beam search decoding integrated with KenLM n-gram language rescoring to resolve ambiguous ligatures[cite: 1, 3].
  - Expose softmax logit distributions and flag tokens with confidence $< 70\%$ for human review[cite: 1, 2, 3, 4].

### Agent 4: Frontend & UI Agent
- **Mission:** Build and maintain the responsive web workspace, synchronizing canvas annotations with the transcription editor[cite: 1, 2].
- **Tech Stack:** React.js, Tailwind CSS, Vite, Lucide-React, Canvas API / SVG.
- **Core Tasks:**
  - Enforce design token uniformity (Slate `#F8FAFC`, Indigo `#4F46E5`, Emerald `#10B981`, Amber `#F59E0B`).
  - Implement the split-view interactive **Workspace** (`/workspace`):
    - Synchronized dual-scrolling between the raw/binarized canvas and the text editor.
    - Click-to-highlight bounding boxes with real-time confidence color badges[cite: 2].
    - Popover verification for uncertain tokens with alternative character glyphs[cite: 2].
  - Render system-wide analytics charts (CER/WER convergence curves and confidence histograms)[cite: 4].

### Agent 5: Backend & Ingestion API Agent
- **Mission:** Construct high-throughput RESTful endpoints and asynchronous batch workers[cite: 1, 4].
- **Tech Stack:** FastAPI, Uvicorn, Celery/Redis, PostgreSQL.
- **Core Tasks:**
  - `POST /api/v1/ingest`: Multipart file uploads for TIFF, PDF, and PNG files[cite: 2].
  - `POST /api/v1/segment`: Return detected line/word bounding boxes and binary previews[cite: 2, 3].
  - `POST /api/v1/transcribe`: Stream character predictions, token confidences, and ALTO XML / Rich JSON output formats[cite: 1, 2, 4].
  - Manage batch queue processing and asynchronous S3/GCS webhook triggers[cite: 2, 4].

---

## 3. Inter-Agent Communication Schemas

### Segmentation Output (`Agent 2` $\rightarrow$ `Agent 3` & `Agent 4`)
```json
{
  "document_id": "folio_ms_1402_deed",
  "image_dimensions": {"width": 3200, "height": 4400},
  "skew_angle": -0.42,
  "lines": [
    {
      "line_id": "L01",
      "bbox": [120, 340, 2900, 85],
      "polygon": [[120, 340], [3020, 345], [3018, 425], [118, 420]],
      "tokens": [
        {"token_id": "T01_01", "bbox": [120, 340, 240, 80]},
        {"token_id": "T01_02", "bbox": [380, 342, 190, 78]}
      ]
    }
  ]
}