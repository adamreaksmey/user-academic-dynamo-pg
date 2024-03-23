import importlib
import os

from functions.exporter import add_export_default
from functions.defaultWriter import ensure_reWrittenDatas_defined
from functions.dataMapper import mapper_function
from functions.sql.generator import insert_data
from functions.dynamoFormatter import format_dynamodb_json

def runInitProcess():
    input_file = "./sources/data.json"
    output_file = "./logs/content.py"
    output_directory = '.'
    holder_directory = './sources/holder.json'

    # format to proper dictionary format
    # The reason this is the same because we are we writing it back to the same file
    format_dynamodb_json(input_file, input_file)

    # Ensure reWrittenDatas is defined in the output file
    ensure_reWrittenDatas_defined(output_file)

    # Execute the function that modifies the output file
    add_export_default(input_file, output_file)

    import logs.content as content_module

    # Reload the module to reflect changes made by add_export_default
    importlib.reload(content_module)

    print("Starting dictionary mapper")
    mapper_function(content_module.reWrittenDatas, output_directory)
    print("Completed mapping ")

    # Generating an sql script
    importlib.reload(content_module)

    print("Initialize SQL mapping")
    q_response = insert_data(content_module.reWrittenDatas)
    output_file = os.path.join(output_directory, 'generated_sql/migration_queries.sql')
    print("SQL mapping completed")

    # chunk size
    chunk_size = 1000
    print("Initalize SQL content writing")

    total_queries = len(q_response)
    chunks = range(0, total_queries, chunk_size)

    with open(output_file, 'w') as file:
        for i in chunks:
            # Extract the current chunk of queries
            chunk = q_response[i:i+chunk_size]
            # Write the current chunk to the file, appending a newline to each query
            file.write('\n'.join(chunk) + '\n')
            
            # Calculate and print the loading status
            percentage_complete = ((i + chunk_size) / total_queries) * 100
            # Ensure percentage does not exceed 100%
            percentage_complete = min(100, percentage_complete)
            print(f"Writing progress: {percentage_complete:.2f}% complete", end='\r')

    # Ensure the final message states completion
    print("Writing progress: 100.00% complete")

if __name__ == "__main__":
    runInitProcess()
