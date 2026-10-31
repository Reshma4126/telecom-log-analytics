import pandas as pd
import io
from pathlib import Path
from typing import Dict, Any, List, Tuple

REQUIRED_COLUMNS = ["call_id", "caller_region", "receiver_region", "duration_seconds", "status"]

def validate_telecom_csv(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Validates CSV format, required columns, and data types for TelecomAnalyzer."""
    size_mb = len(file_bytes) / (1024.0 * 1024.0)
    
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as e:
        return {
            "filename": filename,
            "size_mb": round(size_mb, 2),
            "record_count": 0,
            "column_count": 0,
            "columns": [],
            "dtypes": {},
            "is_valid": False,
            "errors": [f"CSV Parsing Error: {str(e)}"],
            "warnings": [],
            "sample_records": []
        }
        
    errors = []
    warnings = []
    
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns for TelecomAnalyzer: {', '.join(missing_cols)}")
    else:
        # Check numeric duration
        non_numeric_dur = pd.to_numeric(df["duration_seconds"], errors="coerce").isna().sum()
        if non_numeric_dur > 0:
            errors.append(f"Found {non_numeric_dur:,} non-numeric values in 'duration_seconds' column.")
            
        # Check status field
        statuses = set(df["status"].dropna().astype(str).str.upper().unique())
        allowed = {"SUCCESS", "FAILED"}
        unrecognized = statuses - allowed
        if unrecognized:
            warnings.append(f"Unrecognized status values: {', '.join(unrecognized)}. (TelecomAnalyzer counts status == SUCCESS as successful, and status == FAILED as failed; others are ignored).")
            
        # Check nulls
        null_count = df[REQUIRED_COLUMNS].isna().any(axis=1).sum()
        if null_count > 0:
            warnings.append(f"Found {null_count:,} rows with missing values.")
            
    # Sample records
    sample = df.head(15).fillna("").to_dict(orient="records")
    dtypes = {c: str(df[c].dtype) for c in df.columns}
    
    return {
        "filename": filename,
        "size_mb": round(size_mb, 2),
        "record_count": len(df),
        "column_count": len(df.columns),
        "columns": list(df.columns),
        "dtypes": dtypes,
        "is_valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "sample_records": sample
    }

