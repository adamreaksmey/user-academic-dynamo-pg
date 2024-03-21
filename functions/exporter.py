import os

def add_export_default(input_file, output_file):
    try:
        # Check if the input file exists
        if not os.path.exists(input_file):
            # If input file doesn't exist, create a new one
            with open(input_file, 'w') as f:
                # Write default content
                f.write("# Default content\n")
                print("Input file created at", input_file)
        
        # Read content from the input file
        with open(input_file, 'r') as f:
            file_content = f.read()
        
        # Add "export default" in front of the content
        new_content = "reWrittenDatas = " + file_content
        
        # Write the modified content to the output file
        with open(output_file, 'w') as f:
            f.write(new_content)
        
        print("Content successfully written to", output_file)
    
    except FileNotFoundError:
        print("File not found.")