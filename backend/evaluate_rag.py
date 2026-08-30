from app.database.connection import SessionLocal
from app.agents.orchestrator import AgentOrchestrator

test_scenarios = [
    {
        "id": "Test 1: Galaxy S24 Thermal Safeguard",
        "inputs": [
            "My Samsung Galaxy S24 is having an issue.",
            "Purchased around 5 months ago.",
            "The phone is getting extremely hot during fast charging."
        ],
        "expected_intent": "ISSUE_DIAGNOSIS",
        "expected_keyword": "overheat"
    },
    {
        "id": "Test 2: Dell Laptop Boot Diagnostic",
        "inputs": [
            "My Dell Inspiron 15.",
            "About 9 months ago.",
            "It suddenly shuts down when plugged in."
        ],
        "expected_intent": "ISSUE_DIAGNOSIS",
        "expected_keyword": "reset"
    }
]

def run_evaluation():
    db = SessionLocal()
    orchestrator = AgentOrchestrator(db)
    
    for test in test_scenarios:
        conv_id = f"eval-{test['id'].replace(' ', '_')}"
        print(f"\n================ Running: {test['id']} ================")
        last_response = None
        for step_input in test["inputs"]:
            last_response = orchestrator.process_message(conv_id, "CUST-1001", step_input)
        
        assert last_response is not None
        print(f"Final Step Response:\n{last_response['answer']}")
        print(f"Confidence: {last_response['confidence']}")
        print(f"Sources: {[s['title'] for s in last_response.get('sources', [])]}")
        print("✓ Passed scenario.")

if __name__ == "__main__":
    run_evaluation()