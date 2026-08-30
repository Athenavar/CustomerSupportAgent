from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session
from app.database.models import Product, Order, Customer, SupportTicket

class ServiceTools:
    def __init__(self, db: Session):
        self.db = db

    def search_product_catalog(self, query: str):
        query_clean = query.lower()
        products = self.db.query(Product).all()
        matches = []
        for p in products:
            target_str = f"{p.brand} {p.product_name} {p.model}".lower()
            if p.product_name.lower() in query_clean or p.model.lower() in query_clean:
                matches.append(p)
            elif any(part in target_str for part in query_clean.split()):
                matches.append(p)
        return matches

    def get_order_by_product_or_customer(self, customer_id: str, product_id: str = None):
        q = self.db.query(Order).filter(Order.customer_id == customer_id)
        if product_id:
            q = q.filter(Order.product_id == product_id)
        return q.all()

    def evaluate_warranty(self, purchase_date: datetime, warranty_months: int):
        current_date = datetime(2026, 8, 25) # Fixed reference context
        expiry_date = purchase_date + relativedelta(months=warranty_months)
        is_active = current_date <= expiry_date
        return {
            "status": "Active" if is_active else "Expired",
            "purchase_date": purchase_date.strftime("%Y-%m-%d"),
            "expiry_date": expiry_date.strftime("%Y-%m-%d"),
            "warranty_period_months": warranty_months
        }

    def create_escalation_ticket(self, customer_id: str, product_id: str, issue: str, reason: str, confidence: float):
        import uuid
        ticket_id = f"TCK-{uuid.uuid4().hex[:6].upper()}"
        ticket = SupportTicket(
            ticket_id=ticket_id,
            customer_id=customer_id,
            product_id=product_id,
            issue_summary=issue,
            escalation_reason=reason,
            confidence_score=confidence,
            status="OPEN"
        )
        self.db.add(ticket)
        self.db.commit()
        return ticket_id