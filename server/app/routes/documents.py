from fastapi import APIRouter

from app.db import get_connection

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("")
def list_documents():
    query = """
        SELECT
            d.id,
            d.name,
            d.category,
            d.file_name,
            d.file_size_bytes,
            d.requested_on,
            d.uploaded_on,
            d.expires_on,
            c.id   AS client_id,
            c.name AS client,
            CASE
                WHEN d.status = 'received'
                 AND d.expires_on IS NOT NULL
                 AND d.expires_on <= CURRENT_DATE + 30 THEN 'expiring'
                ELSE d.status
            END AS status
        FROM documents d
        JOIN clients c ON c.id = d.client_id
        ORDER BY c.name, d.name
    """

    with get_connection() as conn:
        documents = conn.execute(query).fetchall()

    return documents