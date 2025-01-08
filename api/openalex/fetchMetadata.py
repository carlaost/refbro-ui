from http.client import responses
from typing import List, TypedDict, Optional
import json
from urllib.parse import quote
import httpx

async def fetch_metadata(doi: str):
    """Fetch metadata for a single paper from OpenAlex."""
    full_doi = f"https://doi.org/{doi}" if not doi.startswith("https://doi.org/") else doi
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.openalex.org/works/{quote(full_doi)}")
        response.raise_for_status()
        return response.json()

def handler(request):
    """Vercel Python handler"""
    if request.method != "POST":
        return {
            "statusCode": 405,
            "body": "Method not allowed"
        }

    try:
        body = json.loads(request.body)
        dois = body.get("dois", [])
        
        if not isinstance(dois, list):
            return {
                "statusCode": 400,
                "body": "Invalid input - dois must be an array"
            }

        # Note: For Python runtime, we'll use synchronous requests
        results = []
        for doi in dois:
            try:
                data = httpx.get(f"https://api.openalex.org/works/https://doi.org/{doi}").json()
                results.append({
                    "title": data.get("title", ""),
                    "abstract": data.get("abstract", ""),
                    "authors": [
                        author["author"]["display_name"] 
                        for author in data.get("authorships", [])
                    ],
                    "year": data.get("publication_year", 0),
                    "journal": data.get("primary_location", {}).get("source", {}).get("display_name", "")
                })
            except Exception as e:
                print(f"Error fetching {doi}: {str(e)}")
                continue

        return {
            "statusCode": 200,
            "body": json.dumps({"papers": results}),
            "headers": {
                "Content-Type": "application/json"
            }
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": f"Failed to fetch paper metadata: {str(e)}"
            })
        }
