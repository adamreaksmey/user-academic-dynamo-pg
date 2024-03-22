import os
from functions.exporter import add_export_default
import importlib
from functions.defaultWriter import ensure_reWrittenDatas_defined

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

    print(content_module.reWrittenDatas)

if __name__ == "__main__":
    runInitProcess()
