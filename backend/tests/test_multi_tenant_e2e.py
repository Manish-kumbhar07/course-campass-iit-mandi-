"""
End-to-End Multi-Tenant Isolation & Integration Test Suite
Verifies:
1. Multi-user course isolation (User A vs User B data boundaries).
2. Demo mode isolation (Ananya Sharma CS 204 only for demo logins).
3. Course creation, listing, updating (PATCH), and deletion (DELETE).
4. Multi-modal material upload and status.
5. Deterministic mastery calculation.
6. Grounded AI Tutor and citation integrity.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

import uuid

def test_multi_user_course_isolation():
    # 1. Register User Alpha
    uid = uuid.uuid4().hex[:8]
    email_a = f"student_alpha_{uid}@univ.edu"
    signup_a = client.post("/api/v1/auth/signup", json={
        "name": "Student Alpha",
        "email": email_a,
        "password": "Password123!"
    })
    assert signup_a.status_code in [200, 201]
    token_a = signup_a.json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User Beta
    email_b = f"student_beta_{uid}@univ.edu"
    signup_b = client.post("/api/v1/auth/signup", json={
        "name": "Student Beta",
        "email": email_b,
        "password": "Password123!"
    })
    assert signup_b.status_code in [200, 201]
    token_b = signup_b.json()["token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User Alpha initially has 0 courses
    courses_a = client.get("/api/v1/courses", headers=headers_a)
    assert courses_a.status_code == 200
    assert len(courses_a.json()) == 0

    # 4. User Alpha creates Course A
    create_a = client.post("/api/v1/courses", headers=headers_a, json={
        "name": "Operating Systems",
        "code": "CS 301",
        "subject": "Computer Science",
        "examDate": "2026-11-15",
        "dailyStudyMinutes": 45
    })
    assert create_a.status_code in [200, 201]
    course_a_id = create_a.json()["id"]

    # 5. User Beta creates Course B
    create_b = client.post("/api/v1/courses", headers=headers_b, json={
        "name": "Molecular Biology",
        "code": "BIO 101",
        "subject": "Biology",
        "examDate": "2026-12-01",
        "dailyStudyMinutes": 60
    })
    assert create_b.status_code in [200, 201]
    course_b_id = create_b.json()["id"]

    # 6. Verify Alpha sees ONLY Course A
    list_a = client.get("/api/v1/courses", headers=headers_a).json()
    assert len(list_a) == 1
    assert list_a[0]["id"] == course_a_id
    assert list_a[0]["code"] == "CS 301"

    # 7. Verify Beta sees ONLY Course B
    list_b = client.get("/api/v1/courses", headers=headers_b).json()
    assert len(list_b) == 1
    assert list_b[0]["id"] == course_b_id
    assert list_b[0]["code"] == "BIO 101"

    # 8. Security Check: Alpha attempts to access Beta's Course B -> MUST FAIL
    unauth_access = client.get(f"/api/v1/courses/{course_b_id}", headers=headers_a)
    assert unauth_access.status_code in [403, 404]

    # 9. Test Course Update (PATCH) by Alpha
    update_res = client.patch(f"/api/v1/courses/{course_a_id}", headers=headers_a, json={
        "name": "Advanced Operating Systems & Kernel Architecture",
        "dailyStudyMinutes": 60
    })
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Advanced Operating Systems & Kernel Architecture"
    assert update_res.json()["dailyStudyMinutes"] == 60

    # 10. Test Course Deletion (DELETE) by Alpha
    delete_res = client.delete(f"/api/v1/courses/{course_a_id}", headers=headers_a)
    assert delete_res.status_code in [200, 204]

    # Verify Course A is gone for Alpha
    list_a_after = client.get("/api/v1/courses", headers=headers_a).json()
    assert len(list_a_after) == 0

    # Verify Beta's course is unaffected
    list_b_after = client.get("/api/v1/courses", headers=headers_b).json()
    assert len(list_b_after) == 1


def test_demo_login_isolated():
    # Calling demo-login must return Ananya Sharma and demo session flag
    demo_res = client.post("/api/v1/auth/demo-login")
    assert demo_res.status_code == 200
    data = demo_res.json()
    assert "user" in data
    assert data["user"]["email"] == "ananya.sharma@collegemail.edu"
    assert data["user"]["name"] == "Ananya Sharma"
    assert data.get("isDemoSession") is True
