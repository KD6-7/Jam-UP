"""Creates all tables (if missing) and syncs the product catalog.

Upserts every product in CATALOG by slug and deletes products that are no
longer in it (only if nothing references them). Safe to run repeatedly.

Run with: python -m app.seed
"""

from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import Order, OrderItem, Product  # noqa: F401 (registers tables on Base)

JAR_PRICE_PAISE = 29900
SLICE_PRICE_PAISE = 14900

CATALOG = [
    # Fusion jars (200g)
    {
        "slug": "mango-chilli-jam",
        "name": "Mango Chilli Jam",
        "description": (
            "Sweet mango pulp with a slow-building chilli kick — a fusion jam "
            "that's uniquely Indian in soul. Made with real fruit pulp, "
            "sulphur-less sugar and zero artificial additives."
        ),
        "price_paise": JAR_PRICE_PAISE,
        "weight_grams": 200,
    },
    {
        "slug": "mango-ginger-jam",
        "name": "Mango Ginger Jam",
        "description": (
            "Ripe mango brightened with fresh ginger warmth. Made with real "
            "fruit pulp, sulphur-less sugar and zero artificial additives."
        ),
        "price_paise": JAR_PRICE_PAISE,
        "weight_grams": 200,
    },
    {
        "slug": "guava-chilli-jam",
        "name": "Guava Chilli Jam",
        "description": (
            "Fragrant guava with a fiery chilli edge — the classic Indian "
            "street-side pairing in a jar. Real fruit pulp, sulphur-less "
            "sugar, no artificial additives."
        ),
        "price_paise": JAR_PRICE_PAISE,
        "weight_grams": 200,
    },
    # Chia jars (200g)
    {
        "slug": "apple-cinnamon-chia-jam",
        "name": "Apple Cinnamon Chia Jam",
        "description": (
            "Slow-cooked apple and cinnamon, fortified with chia seeds for an "
            "everyday wellness boost. Real fruit pulp, sulphur-less sugar, no "
            "artificial additives."
        ),
        "price_paise": JAR_PRICE_PAISE,
        "weight_grams": 200,
    },
    {
        "slug": "fig-chia-jam",
        "name": "Fig Chia Jam",
        "description": (
            "Rich, jammy figs fortified with chia seeds. Real fruit pulp, "
            "sulphur-less sugar and zero artificial additives."
        ),
        "price_paise": JAR_PRICE_PAISE,
        "weight_grams": 200,
    },
    {
        "slug": "mango-chia-jam",
        "name": "Mango Chia Jam",
        "description": (
            "Classic mango jam fortified with chia seeds — superfood goodness "
            "in every spoon. Real fruit pulp, sulphur-less sugar, no "
            "artificial additives."
        ),
        "price_paise": JAR_PRICE_PAISE,
        "weight_grams": 200,
    },
    # Jam Slices (pack of 5, 100g)
    {
        "slug": "jam-slice-strawberry",
        "name": "Strawberry Jam Slices",
        "description": (
            "Just peel, place, eat — a mess-free jam sandwich anywhere. Each "
            "even square slice fits right between two slices of bread. "
            "Individually wrapped, pack of 5. 100% natural, no artificial "
            "colours."
        ),
        "price_paise": SLICE_PRICE_PAISE,
        "weight_grams": 100,
    },
    {
        "slug": "jam-slice-mango",
        "name": "Mango Jam Slices",
        "description": (
            "Just peel, place, eat — a mess-free mango jam sandwich anywhere. "
            "Each even square slice fits right between two slices of bread. "
            "Individually wrapped, pack of 5. 100% natural, no artificial "
            "colours."
        ),
        "price_paise": SLICE_PRICE_PAISE,
        "weight_grams": 100,
    },
    {
        "slug": "jam-slice-mixed-fruit",
        "name": "Mixed Fruit Jam Slices",
        "description": (
            "Just peel, place, eat — a mess-free mixed fruit jam sandwich "
            "anywhere. Each even square slice fits right between two slices "
            "of bread. Individually wrapped, pack of 5. 100% natural, no "
            "artificial colours."
        ),
        "price_paise": SLICE_PRICE_PAISE,
        "weight_grams": 100,
    },
]


def seed():
    Base.metadata.create_all(engine)

    catalog_slugs = {p["slug"] for p in CATALOG}
    added = updated = removed = 0

    with SessionLocal() as db:
        for data in CATALOG:
            data = {**data, "image_url": f"/products/{data['slug']}.jpg"}
            existing = db.scalar(select(Product).where(Product.slug == data["slug"]))
            if existing is None:
                db.add(Product(**data))
                added += 1
            else:
                for key, value in data.items():
                    setattr(existing, key, value)
                updated += 1

        for product in db.scalars(select(Product).where(Product.slug.not_in(catalog_slugs))):
            referenced = db.scalar(
                select(OrderItem).where(OrderItem.product_id == product.id)
            )
            if referenced is None:
                db.delete(product)
                removed += 1
            else:
                print(f"kept '{product.slug}' (referenced by orders); marking out of stock")
                product.in_stock = False

        db.commit()

    print(f"Catalog synced: {added} added, {updated} updated, {removed} removed.")


if __name__ == "__main__":
    seed()
