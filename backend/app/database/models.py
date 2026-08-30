from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(String(50), primary_key=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    orders = relationship("Order", back_populates="customer")

class Product(Base):
    __tablename__ = "products"
    product_id = Column(String(50), primary_key=True)
    brand = Column(String(50), index=True, nullable=False)
    product_name = Column(String(100), nullable=False)
    model = Column(String(50), index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False)
    subcategory = Column(String(50))
    release_year = Column(Integer)
    specifications = Column(JSON)
    warranty_months = Column(Integer, default=12)
    manufacturer = Column(String(100))

class Order(Base):
    __tablename__ = "orders"
    order_id = Column(String(50), primary_key=True)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), nullable=False)
    product_id = Column(String(50), ForeignKey("products.product_id"), nullable=False)
    purchase_date = Column(DateTime, nullable=False)
    order_status = Column(String(50), default="Delivered")
    serial_number = Column(String(100), unique=True)
    customer = relationship("Customer", back_populates="orders")
    product = relationship("Product")

class Conversation(Base):
    __tablename__ = "conversations"
    conversation_id = Column(String(50), primary_key=True)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), nullable=True)
    product_id = Column(String(50), ForeignKey("products.product_id"), nullable=True)
    order_id = Column(String(50), ForeignKey("orders.order_id"), nullable=True)
    current_step = Column(String(50), default="PRODUCT_IDENTIFICATION")
    collected_slots = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"
    message_id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(String(50), ForeignKey("conversations.conversation_id"))
    sender = Column(String(20)) # user, assistant, system
    content = Column(Text, nullable=False)
    metadata_payload = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    conversation = relationship("Conversation", back_populates="messages")

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    ticket_id = Column(String(50), primary_key=True)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"))
    product_id = Column(String(50), ForeignKey("products.product_id"))
    order_id = Column(String(50))
    issue_summary = Column(Text)
    escalation_reason = Column(String(255))
    confidence_score = Column(Float)
    status = Column(String(50), default="OPEN")
    created_at = Column(DateTime, default=datetime.utcnow)