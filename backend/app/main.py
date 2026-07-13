import os
import uuid

from fastapi import Body, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth import get_current_user, issue_session_token, verify_google_credential
from app.database import get_db
from app.models import CartItem, Product, User

MAX_QTY = 99


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
    allow_methods=["GET", "POST", "PUT", "DELETE"],
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


# --- Auth ---


def user_to_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "picture_url": user.picture_url,
    }


@app.post("/api/auth/google")
def auth_google(credential: str = Body(..., embed=True), db: Session = Depends(get_db)):
    claims = verify_google_credential(credential)
    user = db.scalar(select(User).where(User.google_sub == claims["sub"]))
    if user is None:
        user = User(
            google_sub=claims["sub"],
            email=claims.get("email", ""),
            name=claims.get("name"),
            picture_url=claims.get("picture"),
        )
        db.add(user)
    else:
        user.email = claims.get("email", user.email)
        user.name = claims.get("name", user.name)
        user.picture_url = claims.get("picture", user.picture_url)
    db.commit()
    db.refresh(user)
    return {"token": issue_session_token(user), "user": user_to_dict(user)}


@app.get("/api/me")
def me(user: User = Depends(get_current_user)):
    return user_to_dict(user)


# --- Cart ---


class CartItemIn(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=0, le=MAX_QTY)


class CartMergeIn(BaseModel):
    items: list[CartItemIn]


def cart_to_dict(db: Session, user: User) -> dict:
    rows = db.execute(
        select(CartItem, Product)
        .join(Product, CartItem.product_id == Product.id)
        .where(CartItem.user_id == user.id, Product.in_stock.is_(True))
        .order_by(CartItem.updated_at)
    ).all()
    items = [
        {"product": product_to_dict(product), "quantity": item.quantity}
        for item, product in rows
    ]
    return {
        "items": items,
        "subtotal_paise": sum(i["product"]["price_paise"] * i["quantity"] for i in items),
    }


@app.get("/api/cart")
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cart_to_dict(db, user)


@app.put("/api/cart/items")
def set_cart_item(
    payload: CartItemIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.get(Product, payload.product_id)
    if product is None or not product.in_stock:
        raise HTTPException(status_code=404, detail="Product not found")
    item = db.scalar(
        select(CartItem).where(
            CartItem.user_id == user.id, CartItem.product_id == payload.product_id
        )
    )
    if payload.quantity == 0:
        if item is not None:
            db.delete(item)
    elif item is None:
        db.add(CartItem(user_id=user.id, product_id=payload.product_id, quantity=payload.quantity))
    else:
        item.quantity = payload.quantity
    db.commit()
    return cart_to_dict(db, user)


@app.post("/api/cart/merge")
def merge_cart(
    payload: CartMergeIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for incoming in payload.items:
        if incoming.quantity <= 0:
            continue
        product = db.get(Product, incoming.product_id)
        if product is None or not product.in_stock:
            continue
        item = db.scalar(
            select(CartItem).where(
                CartItem.user_id == user.id, CartItem.product_id == incoming.product_id
            )
        )
        if item is None:
            db.add(
                CartItem(
                    user_id=user.id,
                    product_id=incoming.product_id,
                    quantity=min(incoming.quantity, MAX_QTY),
                )
            )
        else:
            item.quantity = min(item.quantity + incoming.quantity, MAX_QTY)
    db.commit()
    return cart_to_dict(db, user)
