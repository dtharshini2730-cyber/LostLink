import re
import numpy as np
from PIL import Image
import io
import math
from typing import Dict, Any, List, Optional, Tuple

class AIPreprocessor:
    """
    Production-grade AI Preprocessing Pipeline with Perceptual Hashing, 
    Color Histogram profiling, and NLP TF-IDF text feature extraction.
    """

    @staticmethod
    def preprocess_image(image_bytes: bytes) -> Dict[str, Any]:
        """
        Processes an uploaded image to extract:
        - Perceptual hash (dHash 64-bit)
        - Average hash (aHash 64-bit)
        - 3D Color Histogram vector
        - Dominant color palette
        - Aspect ratio and brightness
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if needed
            if image.mode != "RGB":
                image = image.convert("RGB")

            width, height = image.size
            aspect_ratio = width / height if height > 0 else 1.0

            # 1. dHash (Difference Hash - 8x9 resized grayscale)
            gray_img = image.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
            pixels = list(gray_img.getdata())
            diff_bits = []
            for row in range(8):
                for col in range(8):
                    left = pixels[row * 9 + col]
                    right = pixels[row * 9 + col + 1]
                    diff_bits.append("1" if left > right else "0")
            dhash_str = "".join(diff_bits)

            # 2. aHash (Average Hash - 8x8 resized grayscale)
            small_gray = image.convert("L").resize((8, 8), Image.Resampling.LANCZOS)
            small_pixels = list(small_gray.getdata())
            avg_val = sum(small_pixels) / len(small_pixels) if len(small_pixels) > 0 else 128
            ahash_str = "".join(["1" if p > avg_val else "0" for p in small_pixels])

            # 3. 3D Color Histogram (4x4x4 = 64 bins for fast robust vector math)
            resized_rgb = image.resize((64, 64), Image.Resampling.BILINEAR)
            np_img = np.array(resized_rgb)
            # Bin colors into 4 bins per channel
            r_bin = (np_img[:, :, 0] // 64).clip(0, 3)
            g_bin = (np_img[:, :, 1] // 64).clip(0, 3)
            b_bin = (np_img[:, :, 2] // 64).clip(0, 3)
            hist_indices = r_bin * 16 + g_bin * 4 + b_bin
            hist, _ = np.histogram(hist_indices, bins=64, range=(0, 64))
            hist = hist.astype(float)
            norm = np.linalg.norm(hist)
            if norm > 0:
                hist = hist / norm

            # 4. Dominant Colors (quantize to 5 clusters)
            quantized = image.quantize(colors=5)
            palette = quantized.getpalette()[:15]
            dominant_colors = []
            for i in range(0, min(len(palette), 15), 3):
                dominant_colors.append({
                    "r": palette[i],
                    "g": palette[i+1],
                    "b": palette[i+2],
                    "hex": f"#{palette[i]:02x}{palette[i+1]:02x}{palette[i+2]:02x}"
                })

            avg_brightness = float(np.mean(np_img))

            return {
                "dhash": dhash_str,
                "ahash": ahash_str,
                "color_hist": hist.tolist(),
                "dominant_colors": dominant_colors,
                "aspect_ratio": round(aspect_ratio, 3),
                "avg_brightness": round(avg_brightness, 2),
                "status": "PROCESSED_SUCCESS"
            }
        except Exception as e:
            return {
                "dhash": "0" * 64,
                "ahash": "0" * 64,
                "color_hist": [0.0] * 64,
                "dominant_colors": [],
                "aspect_ratio": 1.0,
                "avg_brightness": 128.0,
                "status": f"FALLBACK_PROCESSED: {str(e)}"
            }

    @staticmethod
    def preprocess_text(text: str) -> Dict[str, Any]:
        """
        Cleans and tokenizes text description, extracting relevant keywords,
        normalizing tokens and computing term frequencies.
        """
        if not text:
            return {"clean_text": "", "tokens": [], "keywords": []}
        
        # Lowercase and clean punctuation
        cleaned = text.lower()
        cleaned = re.sub(r'[^a-z0-9\s]', ' ', cleaned)
        tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 1]
        
        stopwords = {
            "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", 
            "by", "from", "about", "as", "into", "like", "through", "after", "over", 
            "between", "out", "against", "during", "without", "before", "under", 
            "around", "among", "is", "was", "are", "were", "be", "been", "being", 
            "have", "has", "had", "do", "does", "did", "i", "my", "me", "we", "our", 
            "you", "your", "he", "she", "it", "they", "this", "that", "these", "those"
        }
        
        filtered_tokens = [t for t in tokens if t not in stopwords]
        
        # Calculate term frequency
        tf = {}
        for token in filtered_tokens:
            tf[token] = tf.get(token, 0) + 1
            
        return {
            "clean_text": " ".join(filtered_tokens),
            "tokens": filtered_tokens,
            "tf": tf
        }
