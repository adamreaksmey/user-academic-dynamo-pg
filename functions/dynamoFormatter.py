import re

def format_dynamodb_json(input_filename, output_filename):
    try:
        with open(input_filename, 'r') as file:
            content = file.read()
        
        # Replace all instances of "}\n" (end of a JSON object followed by a newline)
        # with "},\n" to separate the objects correctly.
            
        # This assumes each JSON object is on a single line.
        formatted_content = re.sub(r'\}\n', '},\n', content)
        
        # Remove any trailing comma which may exist after the last JSON object
        formatted_content = re.sub(r',\n$', '\n', formatted_content)
        
        # Enclose the entire content within square brackets to form a valid JSON array
        if not (formatted_content.startswith('[') and formatted_content.endswith(']')):
            final_content = f'[{formatted_content.rstrip(",\n")}]'
        else:
            final_content = formatted_content
        
        # Save the formatted content to a new file
        with open(output_filename, 'w') as file:
            file.write(final_content)
        
        print("File has been successfully formatted and saved.")
        
    except FileNotFoundError:
        print(f"File {input_filename} not found.")
    except Exception as e:
        print(f"An error occurred: {e}")