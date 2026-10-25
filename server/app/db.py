import os

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

# Read the settings in server/.env into environment variables
load_dotenv() # reads .env file

DATABASE_URL = os.environ["DATABASE_URL"] # gets database address. If .env is missing it fails


def get_connection():
    """Open a new connection to PostgreSQL.

    row_factory=dict_row makes every row come back as a dictionary,
    like {"id": 1, "title": "..."}, instead of a plain tuple.
    """
    return psycopg.connect(DATABASE_URL, row_factory=dict_row) # dict_row makes every row come back as a dictionary, like {"id": 1, "title": "..."}, instead of a plain tuple.