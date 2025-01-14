import os
import sys
from dotenv import load_dotenv
from pinecone import Pinecone

# Load .env variables
load_dotenv()

def main():
    # Debug prints: confirm we have the expected environment variables
    print("Debug ENV => PINECONE_API_KEY:", os.getenv("PINECONE_API_KEY"))
    print("Debug ENV => PINECONE_INDEX:", os.getenv("PINECONE_INDEX"))

    # Gather Pinecone variables
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    PINECONE_INDEX = os.getenv("PINECONE_INDEX")
    PINECONE_REGION = os.getenv("PINECONE_REGION", "us-east-1")

    # Index name to connect to
    index_name = PINECONE_INDEX
    print(f"Connecting to Pinecone index: {index_name}")

    try:
        # Create an instance of the Pinecone class
        pc = Pinecone(
            api_key=PINECONE_API_KEY,
            environment=PINECONE_REGION
        )

        # Retrieve all indexes (assume it returns a list of index dictionaries)
        all_indexes = pc.list_indexes()
        print(f"Full index info from Pinecone: {all_indexes}")

        # Extract index names directly from the list
        available_index_names = [idx["name"] for idx in all_indexes]
        print(f"Found these index names: {available_index_names}")

        # Check if our desired index is present
        if index_name not in available_index_names:
            raise ValueError(f"Index '{index_name}' does not exist in Pinecone.")

        print(f"Success: Index '{index_name}' is present!")

        # ---------------------------------------------------------
        # Continue with the rest of your script (e.g., upserts, queries, etc.)
        # ---------------------------------------------------------

    except Exception as e:
        print("An error occurred:", e)
        sys.exit(1)

if __name__ == "__main__":
    main()