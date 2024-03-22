import os

def ensure_reWrittenDatas_defined(output_file, default_content="reWrittenDatas = []"):
    """Ensure that the output file defines reWrittenDatas."""
    if not os.path.exists(output_file) or "reWrittenDatas" not in open(output_file).read():
        with open(output_file, 'w') as f:
            f.write(default_content)