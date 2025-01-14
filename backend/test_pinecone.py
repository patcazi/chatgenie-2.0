import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Pinecone with the new class-based approach
pc = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY")
)

# Test connection to primary index
index_name = os.getenv("PINECONE_INDEX")
print(f"Connecting to Pinecone Index: {index_name}")
try:
    if index_name not in [idx.name for idx in pc.list_indexes()]:
        print(f"Index '{index_name}' does not exist!")
    else:
        index = pc.Index(index_name)
        print(f"Index '{index_name}' connected successfully!")
        print(f"Index details: {index.describe_index_stats()}")
except Exception as e:
    print(f"Failed to connect to index '{index_name}': {e}")

# Test connection to secondary index
secondary_index_name = os.getenv("PINECONE_INDEX_TWO")
print(f"\nConnecting to Pinecone Secondary Index: {secondary_index_name}")
try:
    if secondary_index_name not in [idx.name for idx in pc.list_indexes()]:
        print(f"Secondary index '{secondary_index_name}' does not exist!")
    else:
        secondary_index = pc.Index(secondary_index_name)
        print(f"Secondary index '{secondary_index_name}' connected successfully!")
        print(f"Secondary index details: {secondary_index.describe_index_stats()}")
except Exception as e:
    print(f"Failed to connect to secondary index '{secondary_index_name}': {e}")