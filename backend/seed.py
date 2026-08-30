from datetime import datetime
from app.database.connection import SessionLocal, init_db
from app.database.models import Customer, Product, Order
from app.rag.engine import rag_engine

def seed():
    init_db()
    db = SessionLocal()

    # Seed Customers
    cust = Customer(customer_id="CUST-1001", full_name="Alex Mercer", email="alex.m@example.com")
    db.merge(cust)

    # Seed Multi-Category Products
    products = [
        Product(product_id="PROD-S24", brand="Samsung", product_name="Galaxy S24", model="SM-S921B", category="Smartphones", warranty_months=24),
        Product(product_id="PROD-DELL15", brand="Dell", product_name="Inspiron 15", model="INSP-3520", category="Laptops", warranty_months=12),
        Product(product_id="PROD-SONYTV", brand="Sony", product_name="Bravia 4K TV", model="KD-55X75L", category="Televisions", warranty_months=36),
        Product(product_id="PROD-AIRPODS", brand="Apple", product_name="AirPods Pro 2", model="A2931", category="Audio", warranty_months=12),
        Product(product_id="PROD-LGFRIDGE", brand="LG", product_name="Smart Inverter Refrigerator", model="GL-T432APZY", category="Appliances", warranty_months=24),
    ]
    for p in products:
        db.merge(p)

    # Seed Verified Orders
    orders = [
        Order(order_id="ORD-7821", customer_id="CUST-1001", product_id="PROD-S24", purchase_date=datetime(2026, 3, 15), order_status="Delivered"),
        Order(order_id="ORD-5521", customer_id="CUST-1001", product_id="PROD-DELL15", purchase_date=datetime(2025, 11, 12), order_status="Delivered")
    ]
    for o in orders:
        db.merge(o)

    db.commit()

    # Index RAG Manuals
    rag_engine.index_document(
        doc_id="doc-s24-heat",
        content="Samsung Galaxy S24 Battery & Thermal Behavior: Device can become warm during Super Fast Charging 2.0 or intensive graphic applications. If temperature exceeds thresholds, performance auto-throttles.",
        metadata={"brand": "Samsung", "category": "Smartphones", "document_name": "Galaxy S24 User Manual", "page": 72, "section": "Thermal Safeguards"}
    )
    rag_engine.index_document(
        doc_id="doc-dell-power",
        content="Dell Inspiron 15 Power Troubleshooting: For sudden shutdown issues, check the AC Adapter LED status. Perform a hard reset by removing peripherals and holding power button for 20 seconds.",
        metadata={"brand": "Dell", "category": "Laptops", "document_name": "Inspiron 15 Service Manual", "page": 34, "section": "Power Diagnostics"}
    )
    print("Database & RAG Vector index successfully seeded.")

if __name__ == "__main__":
    seed()