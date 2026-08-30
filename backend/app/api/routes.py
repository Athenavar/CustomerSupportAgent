from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database.connection import get_db
from app.database.models import Product, Customer, Order, SupportTicket, Conversation, Message
from app.agents.orchestrator import AgentOrchestrator
from app.rag.engine import rag_engine

router = APIRouter()

class ChatRequest(BaseModel):
    conversation_id: str
    customer_id: str
    message: str

class ProductCreate(BaseModel):
    product_id: str
    brand: str
    product_name: str
    model: str
    category: str
    warranty_months: int

@router.post("/chat")
def chat_endpoint(payload: ChatRequest, db: Session = Depends(get_db)):
    orchestrator = AgentOrchestrator(db)
    return orchestrator.process_message(payload.conversation_id, payload.customer_id, payload.message)

@router.get("/products")
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.post("/products")
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    return {"status": "success", "product_id": product.product_id}

@router.get("/customers/{customer_id}")
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    orders = db.query(Order).filter(Order.customer_id == customer_id).all()
    return {"customer": cust.full_name, "email": cust.email, "orders": orders}

@router.get("/tickets")
def list_tickets(db: Session = Depends(get_db)):
    return db.query(SupportTicket).all()

@router.post("/documents/index-text")
def index_document_text(doc_id: str, text: str, brand: str, category: str, doc_name: str):
    rag_engine.index_document(
        doc_id=doc_id,
        content=text,
        metadata={"brand": brand, "category": category, "document_name": doc_name, "page": 1, "section": "Diagnostics"}
    )
    return {"status": "indexed", "id": doc_id}