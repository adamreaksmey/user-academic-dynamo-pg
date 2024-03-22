import json
import re
from pathlib import Path
import uuid

from functions.operations.data import dob_handler, id_card_handler, schoolIdHandler

def mapper_function(data, output_directory):
    # Construct the file path for the output
    output_path = Path(output_directory) / "logs/content.py"

    # Process the data
    removed_item_name = [item['Item'] for item in data]
    removed_value_prefix = []

    for item in removed_item_name:
        if item.get("organizationId", {}).get("S", "") and 'schoolId' not in item:
            mapped_data = {
                "tableName": "student",
                "schoolId": schoolIdHandler(item.get("organizationId", {}).get("S", "")),
                "campusId": "",
                "idCard": id_card_handler(item.get("idCard", {}).get("S", "")),
                "firstName": item.get("firstName", {}).get("S", "N/A"),
                "lastName": item.get("lastName", {}).get("S", "N/A"),
                "firstNameNative": item.get("firstName", {}).get("S", ""),
                "lastNameNative": item.get("lastName", {}).get("S", ""),
                "gender": item.get("gender", {}).get("S", "").lower(),
                "dob": dob_handler(item) or "",
                "remark": [item.get("remark", {}).get("S", "")],
                "status": item.get("status", {}).get("S", "start"),
                "profile": {
                    "position": item.get("position", {}).get("S", "").replace("'", "`"),
                    "phone": item.get("phone", {}).get("S", "")
                }
            }

            removed_value_prefix.append(mapped_data)

    # Write the processed data to a file
    with open(output_path, 'w') as f:
        f.write(f"reWrittenDatas = {json.dumps(removed_value_prefix, indent = 2)}")

