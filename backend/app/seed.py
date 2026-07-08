"""Creates all tables (if missing) and seeds 3 sample products.

Run with: python -m app.seed
"""

from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import Order, OrderItem, Product  # noqa: F401 (registers tables on Base)

SEED_PRODUCTS = [
    {
        "slug": "strawberry-jam",
        "name": "Strawberry Jam",
        "description": "Classic strawberry jam made with real fruit.",
        "price_paise": 24900,
        "weight_grams": 250,
        "image_url": None,
    },
    {
        "slug": "mixed-fruit-jam",
        "name": "Mixed Fruit Jam",
        "description": "A blend of seasonal fruits in one jar.",
        "price_paise": 27900,
        "weight_grams": 250,
        "image_url": None,
    },
    {
        "slug": "orange-marmalade",
        "name": "Orange Marmalade",
        "description": "Tangy orange marmalade with real peel.",
        "price_paise": 22900,
        "weight_grams": 250,
        "image_url": None,
    },
]


def seed():
    Base.metadata.create_all(engine)

    with SessionLocal() as db:
        for data in SEED_PRODUCTS:
            existing = db.scalar(select(Product).where(Product.slug == data["slug"]))
            if existing is None:
                db.add(Product(**data))
        db.commit()

    print(f"Seeded {len(SEED_PRODUCTS)} products (skipped any that already existed).")


if __name__ == "__main__":
    seed()
