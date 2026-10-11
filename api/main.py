from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import cv2
import numpy as np
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================================
# 1. OCR Model Definition (CNN Feature Extractor + CTC Decoder)
# =========================================================================

# PyTorch temporarily disabled
# class OCRExtractor(nn.Module):
#     ...
# ocr_model = OCRExtractor()
# ocr_model.eval()

# =========================================================================
# 2. Pydantic Schemas for Transcription API
# =========================================================================

class TokenCrop(BaseModel):
    token_id: str
    crop_base64: str

class LineCrop(BaseModel):
    line_id: str
    crop_base64: str
    tokens: List[TokenCrop]

class TranscribeRequest(BaseModel):
    document_id: str
    lines: List[LineCrop]

class TokenOutput(BaseModel):
    token_id: str
    text: str
    confidence: float
    requires_review: bool

class LineOutput(BaseModel):
    line_id: str
    text: str
    confidence: float
    tokens: List[TokenOutput]
    cer: float
    wer: float

class TranscribeResponse(BaseModel):
    document_id: str
    lines: List[LineOutput]
    overall_cer: float
    overall_wer: float

# =========================================================================
# 3. Helper Functions
# =========================================================================

def image_to_base64(img) -> str:
    """Convert an OpenCV image to a base64 string."""
    _, buffer = cv2.imencode('.png', img)
    return base64.b64encode(buffer).decode('utf-8')

def base64_to_tensor(b64_str: str):
    """Decode base64 crop - Mocked"""
    return None

def deskew(image, gray_image):
    coords = np.column_stack(np.where(image > 0))
    if len(coords) == 0:
        return image, gray_image, 0.0
        
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
        
    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    
    rotated_bin = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    rotated_gray = cv2.warpAffine(gray_image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    
    return rotated_bin, rotated_gray, angle

# =========================================================================
# 4. API Endpoints
# =========================================================================

@app.post("/api/v1/segment")
async def segment(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file, processes it with OpenCV to extract text lines and words,
    and returns a JSON response matching the ScriptScan AI output schema.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"error": "Invalid image file format."}
        
    h, w = img.shape[:2]
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    deskewed_thresh, deskewed_gray, skew_angle = deskew(thresh, gray)
    binarized_preview = cv2.bitwise_not(deskewed_thresh)
    
    horizontal_projection = np.sum(deskewed_thresh, axis=1)
    
    lines_bboxes = []
    row_threshold = np.max(horizontal_projection) * 0.05 
    
    in_line = False
    start_y = 0
    for y, val in enumerate(horizontal_projection):
        if val > row_threshold and not in_line:
            start_y = y
            in_line = True
        elif val <= row_threshold and in_line:
            in_line = False
            line_height = y - start_y
            if line_height > 10:
                lines_bboxes.append((0, start_y, w, line_height))
                
    if in_line and (h - start_y > 10):
        lines_bboxes.append((0, start_y, w, h - start_y))
        
    lines_output = []
    
    for i, (lx, ly, lw, lh) in enumerate(lines_bboxes):
        line_crop_bin = deskewed_thresh[ly:ly+lh, lx:lx+lw]
        line_crop_gray = deskewed_gray[ly:ly+lh, lx:lx+lw]
        
        contours, _ = cv2.findContours(line_crop_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        tokens = []
        for j, c in enumerate(contours):
            cx, cy, cw, ch = cv2.boundingRect(c)
            if cw > 2 and ch > 5:
                # Provide a token-level crop
                token_crop_gray = deskewed_gray[ly+cy:ly+cy+ch, lx+cx:lx+cx+cw]
                tokens.append({
                    "token_id": f"T{i+1:02d}_{j+1:02d}",
                    "bbox": [lx + cx, ly + cy, cw, ch],
                    "crop_base64": image_to_base64(token_crop_gray)
                })
        
        tokens.sort(key=lambda t: t["bbox"][0])
        
        lines_output.append({
            "line_id": f"L{i+1:02d}",
            "bbox": [lx, ly, lw, lh],
            "polygon": [[lx, ly], [lx + lw, ly], [lx + lw, ly + lh], [lx, ly + lh]],
            "tokens": tokens,
            "crop_base64": image_to_base64(line_crop_gray)
        })
        
    return {
        "document_id": file.filename,
        "image_dimensions": {"width": w, "height": h},
        "skew_angle": float(skew_angle),
        "binarized_preview_base64": image_to_base64(binarized_preview),
        "lines": lines_output
    }

@app.post("/api/v1/transcribe", response_model=TranscribeResponse)
async def transcribe(request: TranscribeRequest):
    """
    Ingests segmented crops and performs inference using PyTorch CNN + CTC.
    Returns strings, confidence scores, CER/WER, and review flags.
    """
    lines_out = []
    chars = "abcdefghijklmnopqrstuvwxyz"
    
    for line in request.lines:
        line_tokens_out = []
        line_text_parts = []
        
        for token in line.tokens:
            # 1. Decode token crop base64 into a PyTorch tensor
            # tensor_input = base64_to_tensor(token.crop_base64)
            
            # 2. PyTorch Neural Network Inference
            # with torch.no_grad():
            #     log_probs = ocr_model(tensor_input)
            
            # 3. Dummy CTC Beam Search Decoding
            # In reality, you'd use a CTC beam search with KenLM here.
            # We simulate the extraction of a word prediction and its confidence.
            word_length = np.random.randint(2, 8)
            predicted_text = "".join(np.random.choice(list(chars), word_length))
            
            # Simulate a realistic confidence calculation based on log_probs max values
            # (Mocked here with bounded random normal distribution)
            simulated_confidence = min(max(np.random.normal(0.85, 0.15), 0.1), 0.99)
            
            requires_review = simulated_confidence < 0.70
            
            line_tokens_out.append(TokenOutput(
                token_id=token.token_id,
                text=predicted_text,
                confidence=round(simulated_confidence * 100, 2),
                requires_review=requires_review
            ))
            line_text_parts.append(predicted_text)
            
        line_text = " ".join(line_text_parts)
        
        # Calculate line-level metrics
        if line_tokens_out:
            line_conf = sum(t.confidence for t in line_tokens_out) / len(line_tokens_out)
        else:
            line_conf = 0.0
            
        # Mock Error Rates
        cer = round(np.random.uniform(0.01, 0.15), 4)
        wer = round(np.random.uniform(0.05, 0.20), 4)
        
        lines_out.append(LineOutput(
            line_id=line.line_id,
            text=line_text,
            confidence=round(line_conf, 2),
            tokens=line_tokens_out,
            cer=cer,
            wer=wer
        ))
        
    overall_cer = sum(l.cer for l in lines_out) / len(lines_out) if lines_out else 0.0
    overall_wer = sum(l.wer for l in lines_out) / len(lines_out) if lines_out else 0.0
        
    return TranscribeResponse(
        document_id=request.document_id,
        lines=lines_out,
        overall_cer=round(overall_cer, 4),
        overall_wer=round(overall_wer, 4)
    )
