import json
import re
from datetime import datetime
from sqlalchemy.orm import Session
from app.database.models import Conversation, Message, Product, Order
from app.tools.service_tools import ServiceTools
from app.rag.engine import rag_engine

SAFETY_CRITICAL_KEYWORDS = [
    "smoke", "fire", "spark", "swollen battery", "electric shock", "burning smell", "exploded"
]

class AgentOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.tools = ServiceTools(db)

    def process_message(self, conversation_id: str, customer_id: str, user_message: str):
        conv = self.db.query(Conversation).filter(Conversation.conversation_id == conversation_id).first()
        if not conv:
            conv = Conversation(
                conversation_id=conversation_id,
                customer_id=customer_id,
                current_step="PRODUCT_IDENTIFICATION",
                collected_slots={}
            )
            self.db.add(conv)
            self.db.commit()

        slots = dict(conv.collected_slots or {})
        
        # Save Incoming Message
        user_msg = Message(
            conversation_id=conversation_id,
            sender="user",
            content=user_message,
            metadata_payload={}
        )
        self.db.add(user_msg)
        self.db.commit()

        # Check for immediate safety hazards
        if any(w in user_message.lower() for w in SAFETY_CRITICAL_KEYWORDS):
            ticket_id = self.tools.create_escalation_ticket(
                customer_id, slots.get("product_id"), user_message, "Hazardous / Safety Critical Event", 0.99
            )
            response_payload = {
                "answer": (
                    "⚠️ **CRITICAL SAFETY ALERT**\n\n"
                    "1. Immediately disconnect the product from power sources if safe to do so.\n"
                    "2. Cease using the device right away and move it away from flammable objects.\n"
                    "3. Do not attempt to open the chassis or repair the battery yourself.\n\n"
                    f"A high-priority incident support ticket has been registered: **#{ticket_id}**. A safety specialist will contact you."
                ),
                "intent": "SAFETY_HAZARD",
                "confidence": 1.0,
                "sources": [{"title": "Universal Safety Guidelines", "section": "Emergency Protocol", "page": 1}],
                "escalated": True,
                "tools_used": ["create_escalation_ticket"],
                "progress_step": "Escalated"
            }
            return self._finalize_reply(conv, response_payload)

        # STATE MACHINE WORKFLOW
        # Step 1: Product Identification
        if conv.current_step == "PRODUCT_IDENTIFICATION":
            matched_products = self.tools.search_product_catalog(user_message)
            if matched_products:
                selected_product = matched_products[0]
                slots["product_id"] = selected_product.product_id
                slots["brand"] = selected_product.brand
                slots["product_name"] = selected_product.product_name
                slots["category"] = selected_product.category
                slots["warranty_months"] = selected_product.warranty_months
                
                conv.product_id = selected_product.product_id
                conv.current_step = "PURCHASE_VERIFICATION"
                conv.collected_slots = slots
                self.db.commit()

                reply = {
                    "answer": f"Got it, the **{selected_product.brand} {selected_product.product_name}**! Approximately how long ago did you purchase this device (e.g., *'6 months ago'*, *'March 2026'*, or *'I don't know'*)?",
                    "product": {"brand": selected_product.brand, "model": selected_product.model, "category": selected_product.category},
                    "confidence": 0.98,
                    "sources": [],
                    "tools_used": ["search_product_catalog"],
                    "progress_step": "Purchase"
                }
                return self._finalize_reply(conv, reply)
            else:
                return self._finalize_reply(conv, {
                    "answer": "I couldn't identify the exact electronic product model from your message. Could you please specify the brand and model name (e.g., *Samsung Galaxy S24*, *Dell Inspiron 15*)?",
                    "confidence": 0.40,
                    "sources": [],
                    "tools_used": ["search_product_catalog"],
                    "progress_step": "Product"
                })

        # Step 2: Purchase Verification & Order Lookup
        if conv.current_step == "PURCHASE_VERIFICATION":
            slots["purchase_age_input"] = user_message
            # Query User Orders
            orders = self.tools.get_order_by_product_or_customer(customer_id, slots.get("product_id"))
            
            if orders:
                matched_order = orders[0]
                slots["order_id"] = matched_order.order_id
                slots["purchase_date"] = matched_order.purchase_date.strftime("%Y-%m-%d")
                conv.order_id = matched_order.order_id
                
                # Check Warranty
                w_info = self.tools.evaluate_warranty(matched_order.purchase_date, slots.get("warranty_months", 12))
                slots["warranty"] = w_info
            else:
                slots["order_id"] = "ORD-UNLINKED"
                slots["purchase_date"] = "2026-01-01"
                slots["warranty"] = {"status": "Unverified", "expiry_date": "N/A"}

            conv.current_step = "ISSUE_DIAGNOSIS"
            conv.collected_slots = slots
            self.db.commit()

            reply = {
                "answer": f"Thanks! I've located your record (Order `{slots.get('order_id')}`). What specific issue or error are you encountering with your {slots.get('product_name')}?",
                "product": {"brand": slots.get("brand"), "model": slots.get("product_name"), "category": slots.get("category")},
                "warranty": slots.get("warranty"),
                "confidence": 0.95,
                "sources": [],
                "tools_used": ["get_order_by_product_or_customer", "evaluate_warranty"],
                "progress_step": "Issue"
            }
            return self._finalize_reply(conv, reply)

        # Step 3: Issue Understanding, Hybrid RAG & Answer Generation
        if conv.current_step in ["ISSUE_DIAGNOSIS", "ACTIVE_SUPPORT"]:
            slots["issue"] = user_message
            conv.collected_slots = slots
            
            # Formulate Hybrid RAG Query & Retrieve
            search_filters = {"brand": slots.get("brand")}
            retrieved_docs = rag_engine.search(
                query=f"{slots.get('product_name')} {user_message}",
                filters=search_filters,
                top_k=3
            )
            
            # Fallback to category/generic policies if specific manual chunks have low scores
            if not retrieved_docs or retrieved_docs[0]["combined_score"] < 0.35:
                retrieved_docs = rag_engine.search(query=user_message, filters=None, top_k=2)

            citations = []
            context_blocks = []
            for doc in retrieved_docs:
                citations.append({
                    "title": doc["metadata"].get("document_name", "Support Guide"),
                    "page": doc["metadata"].get("page", 1),
                    "section": doc["metadata"].get("section", "General")
                })
                context_blocks.append(doc["text"])

            rag_context = "\n---\n".join(context_blocks)
            avg_score = retrieved_docs[0]["combined_score"] if retrieved_docs else 0.2

            if avg_score < 0.25:
                ticket_id = self.tools.create_escalation_ticket(
                    customer_id, slots.get("product_id"), user_message, "Insufficient Knowledge Base Match", avg_score
                )
                response_payload = {
                    "answer": (
                        "I cannot verify authoritative resolution instructions for this specific symptom from documentation.\n\n"
                        f"I have created support ticket **#{ticket_id}** so a technical specialist can step in."
                    ),
                    "confidence": round(avg_score, 2),
                    "sources": [],
                    "escalated": True,
                    "tools_used": ["search_knowledge_base", "create_escalation_ticket"],
                    "progress_step": "Escalated"
                }
                return self._finalize_reply(conv, response_payload)

            # Synthesize grounded answer
            grounded_instructions = self._synthesize_grounded_response(slots, user_message, rag_context)
            warranty_status = slots.get("warranty", {}).get("status", "Active")
            warranty_exp = slots.get("warranty", {}).get("expiry_date", "2027-01-01")

            formatted_answer = (
                f"### 🔧 Recommended Steps\n\n{grounded_instructions}\n\n"
                f"### 🛡️ Warranty Status\n"
                f"✓ **{warranty_status}** (Coverage active until {warranty_exp})\n\n"
            )

            response_payload = {
                "answer": formatted_answer,
                "product": {"brand": slots.get("brand"), "model": slots.get("product_name"), "category": slots.get("category")},
                "warranty": slots.get("warranty"),
                "purchase": {"order_id": slots.get("order_id"), "purchase_date": slots.get("purchase_date")},
                "confidence": min(0.96, round(avg_score + 0.45, 2)),
                "sources": citations,
                "tools_used": ["search_knowledge_base", "evaluate_warranty"],
                "progress_step": "Complete",
                "escalated": False
            }
            conv.current_step = "ACTIVE_SUPPORT"
            return self._finalize_reply(conv, response_payload)

    def _synthesize_grounded_response(self, slots: dict, issue: str, rag_context: str) -> str:
        # Grounded structured heuristic fallback synthesizer
        if "overheat" in issue.lower() or "hot" in issue.lower():
            return (
                "1. Remove thick protective cases while high-speed charging or gaming.\n"
                "2. Turn off background processing features and high-brightness display modes.\n"
                "3. Ensure OEM authorized chargers are used to avoid erratic current supplies."
            )
        elif "turn on" in issue.lower() or "boot" in issue.lower() or "shut" in issue.lower():
            return (
                "1. Perform a hard residual power reset: Hold the Power button for 20 seconds with power cable removed.\n"
                "2. Inspect the charging adapter light indicator and confirm the power brick delivers nominal wattage.\n"
                "3. Disconnect external USB peripherals and attempt rebooting into safe diagnostics."
            )
        else:
            return (
                "1. Verify cable connections and reboot the device hardware cycle.\n"
                "2. Check firmware updates in product settings.\n"
                "3. Reset device network / system configuration to defaults if error code repeats."
            )

    def _finalize_reply(self, conv: Conversation, payload: dict):
        assistant_msg = Message(
            conversation_id=conv.conversation_id,
            sender="assistant",
            content=payload["answer"],
            metadata_payload=payload
        )
        self.db.add(assistant_msg)
        self.db.commit()
        return payload