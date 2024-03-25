#include <fstream>
#include <iostream>

void formatDynamoDBJsonLargeFiles(const std::string& inputFilename, const std::string& outputFilename) {
    std::ifstream inFile(inputFilename);
    if (!inFile.is_open()) {
        std::cout << "Failed to open file: " << inputFilename << std::endl;
        return;
    }

    std::ofstream outFile(outputFilename);
    if (!outFile.is_open()) {
        std::cout << "Failed to create file: " << outputFilename << std::endl;
        inFile.close();
        return;
    }

    std::cout << "Correcting your dynamoJSON file to proper JSON :) " << std::endl;

    std::string line;
    bool isFirstLine = true;

    // Start the JSON array
    outFile << "[";

    while (getline(inFile, line)) {
        // Process each line
        if (isFirstLine) {
            isFirstLine = false;
        } else {
            // Add a comma to separate JSON objects, except before the first one
            outFile << ",\n";
        }

        if (line.back() == ',') {
            // If the line ends with a comma (which shouldn't happen in proper JSON), remove it
            line.pop_back();
        }
        outFile << line;
    }

    // Close the JSON array
    outFile << "]";

    inFile.close();
    outFile.close();

    std::cout << "File has been successfully corrected & formatted and saved." << std::endl;
}

int main() {
    formatDynamoDBJsonLargeFiles("./sources/data.json", "./sources/formatted_data.json");
    return 0;
}
