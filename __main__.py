import os
from functions.exporter import add_export_default
import importlib

def ensure_reWrittenDatas_defined(output_file, default_content="reWrittenDatas = []"):
    """Ensure that the output file defines reWrittenDatas."""
    if not os.path.exists(output_file) or "reWrittenDatas" not in open(output_file).read():
        with open(output_file, 'w') as f:
            f.write(default_content)

def runInitProcess():
    input_file = "./sources/data.json"
    output_file = "./logs/content.py"

    # Ensure reWrittenDatas is defined in the output file
    ensure_reWrittenDatas_defined(output_file)

    # Execute the function that modifies the output file
    add_export_default(input_file, output_file)

    # Import the module containing reWrittenDatas
    import logs.content as content_module

    # Reload the module to reflect changes made by add_export_default
    importlib.reload(content_module)

    # Access the updated reWrittenDatas
    print(content_module.reWrittenDatas)

if __name__ == "__main__":
    runInitProcess()
