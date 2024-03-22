import os
import re

def add_export_default(input_file, output_file):
    try:
        # Check if the input file exists
        if not os.path.exists(input_file):
            print("Input file does not exist, creating with default content.")
            with open(input_file, 'w') as f:
                f.write("# Default content\n")
                return  # End execution after creating the default file
        
        # Read content from the input file as a plain string
        with open(input_file, 'r') as f:
            file_content = f.read()
        
        # Optimize regular expressions by combining them
        file_content = re.sub(r'\btrue\b', 'True', re.sub(r'\bfalse\b', 'False', file_content))
        
        # Prepare new content with modifications
        new_content = "reWrittenDatas = " + file_content
        
        # Write the modified content to the output file
        with open(output_file, 'w') as f:
            f.write(new_content)
        
        print("Content successfully written to", output_file)
    
    except FileNotFoundError:
        print("File not found.")
