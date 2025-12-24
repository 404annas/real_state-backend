import os
import re
import argparse

def recreate_project_from_file(input_file_path, output_dir):
    """
    Reads a combined project text file and recreates the directory
    and file structure.
    """
    print("--- PROJECT RECREATION SCRIPT STARTING ---")
    
    # Step 1: Safety check and create the main output directory
    if os.path.exists(output_dir):
        print(f"Error: Output directory '{output_dir}' already exists.")
        print("Please remove it or choose a different name to avoid overwriting data.")
        return
        
    print(f"Creating project in new directory: '{output_dir}'")
    os.makedirs(output_dir)

    # Step 2: Read the entire content of the combined file
    try:
        with open(input_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: Input file '{input_file_path}' not found.")
        return

    # Step 3: Use regex to find all file blocks
    # This pattern is robust and finds the path and content for each file.
    # re.DOTALL allows '.' to match newline characters.
    file_pattern = re.compile(
        r"--- START OF FILE: (.*?) ---\n\n(.*?)\n\n--- END OF FILE: \1 ---",
        re.DOTALL
    )

    files_created = 0
    matches = file_pattern.finditer(content)
    
    for match in matches:
        # Extract the relative path and the file's content from the match
        relative_path = match.group(1).strip()
        file_content = match.group(2)

        # Normalize path separators for the current operating system (e.g., / becomes \)
        normalized_path = os.path.normpath(relative_path)
        full_path = os.path.join(output_dir, normalized_path)

        try:
            # Step 4: Create the necessary parent directories for the file
            directory = os.path.dirname(full_path)
            if directory:
                os.makedirs(directory, exist_ok=True)

            # Step 5: Write the content to the new file
            with open(full_path, 'w', encoding='utf-8') as new_file:
                new_file.write(file_content)
            
            print(f"  [OK] Created: {full_path}")
            files_created += 1

        except Exception as e:
            print(f"  [ERROR] Failed to create file {full_path}: {e}")

    if files_created > 0:
        print(f"\nSuccessfully recreated {files_created} files.")
        print("--- SCRIPT FINISHED ---")
    else:
        print("\nNo files were found in the input file to recreate.")
        print("--- SCRIPT FINISHED ---")


def main():
    parser = argparse.ArgumentParser(
        description="Recreate a project structure from a combined text file."
    )
    parser.add_argument(
        "input_file", 
        type=str, 
        help="The path to the combined project text file (e.g., combined_project_code.txt)."
    )
    parser.add_argument(
        "output_directory", 
        type=str, 
        help="The name of the new directory where the project will be recreated."
    )
    
    args = parser.parse_args()
    
    recreate_project_from_file(args.input_file, args.output_directory)

if __name__ == "__main__":
    main()