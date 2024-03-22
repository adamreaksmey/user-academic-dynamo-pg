import json
import os
from pathlib import Path

# Assuming dobHandler, idCardHandler, and startDateHandler are equivalent Python functions
from operations.data import dob_handler, id_card_handler, start_date_handler

def mapper_function(data, output_directory):
    # Construct the file path for the output
    output_path = Path(output_directory) / "logs/data.py"

    # Process the data
    removed_item_name = [item['Item'] for item in data]
    removed_value_prefix = []

    for item in removed_item_name:
        mapped_data = {
            "tableName": "students",
            "schoolId": item.get("organizationId", {}).get("S", ""),
            "campusId": "",
            "idCard": id_card_handler(item.get("idCard", {}).get("S", "")),
            "firstName": item.get("firstName", {}).get("S", ""),
            "lastName": item.get("lastName", {}).get("S", ""),
            "firstNameNative": item.get("firstName", {}).get("S", ""),
            "lastNameNative": item.get("lastName", {}).get("S", ""),
            "gender": item.get("gender", {}).get("S", "").lower(),
            "dob": dob_handler(item) or "",
            "remark": item.get("remark", {}).get("S", ""),
            "status": item.get("status", {}).get("S", "")
        }

        removed_value_prefix.append(mapped_data)

    # Write the processed data to a file
    with open(output_path, 'w') as f:
        f.write(f"reWrittenDatas = {json.dumps(removed_value_prefix, indent=2)}")

# Example usage
# Assuming `data` is a list of dictionaries representing your data,
# and assuming the equivalent Python functions `dob_handler`, `id_card_handler`, and `start_date_handler` are defined
data = [...]  # Your data here
output_directory = '.'  # Adjust as necessary
mapper_function(data, output_directory)
