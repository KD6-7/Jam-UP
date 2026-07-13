import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product


def product_to_dict(p: Product) -> dict:
    return {
        "id": str(p.id),
        "slug": p.slug,
        "name": p.name,
        "description": p.description,
        "price_paise": p.price_paise,
        "weight_grams": p.weight_grams,
        "image_url": p.image_url,
    }

app = FastAPI()

allowed_origins = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_ORIGIN", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/products")
def list_products(db: Session = Depends(get_db)):
    products = db.scalars(select(Product).where(Product.in_stock.is_(True))).all()
    return [product_to_dict(p) for p in products]


@app.get("/api/products/{slug}")
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(select(Product).where(Product.slug == slug))
    if product is None or not product.in_stock:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_dict(product)
