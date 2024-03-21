from functions.exporter import add_export_default


def runInitProcess():

    input_file = "./sources/data.json"
    output_file = "./logs/content.py"
    add_export_default(input_file, output_file)
    

if __name__ == "__main__":
    runInitProcess()
