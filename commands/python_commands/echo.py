import sys

def run():
    # Get the argument passed from the bot (this will be the text after `!python echo`)
    text_to_echo = sys.argv[1]  # Get the first argument passed to the script
    print(text_to_echo)  # Print the text so it can be returned to Discord

if __name__ == "__main__":
    run()
