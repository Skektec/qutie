import sys
import os
import importlib

command_dir = os.path.join(os.path.dirname(__file__), 'python_commands')
print(f"Adding path: {command_dir}")
sys.path.append(command_dir)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No command provided.")
        sys.exit(1)

    command = sys.argv[1]
    try:
        command_module = importlib.import_module(command)
        command_module.run()
    except ModuleNotFoundError:
        print(f"Error: Command '{command}' not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
