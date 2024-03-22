import importlib
import os

from functions.exporter import add_export_default
from functions.defaultWriter import ensure_reWrittenDatas_defined
from functions.dataMapper import mapper_function
from functions.sql.generator import insert_data

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
    output_directory = '.'  # Adjust as necessary
    mapper_function(content_module.reWrittenDatas, output_directory)

    # Generating an sql script
    importlib.reload(content_module)
    q_response = insert_data(content_module.reWrittenDatas)
    output_directory = '.'  # Adjust this to your specific directory structure
    output_file = os.path.join(output_directory, 'generated_sql/migration_queries.sql')

    # Write the SQL queries to a file
    with open(output_file, 'w') as file:
        file.write("\n".join(q_response))

if __name__ == "__main__":
    runInitProcess()
