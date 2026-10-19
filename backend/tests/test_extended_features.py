"""Tests for extended wardrobe product APIs."""
from fastapi.testclient import TestClient
import main


def register(client, name, email):
    r=client.post("/api/v1/auth/register", json={"name":name,"email":email,"password":"StrongPass123!"})
    assert r.status_code == 201, r.text


def garment(client, name, category, subcategory, style, color):
    r=client.post("/api/v1/garments", json={"name":name,"category":category,"subcategory":subcategory,"style":style,"color":color,"season":"all-season","occasions":["casual","festive"],"tags":[],"notes":"","imageData":""})
    assert r.status_code == 201, r.text
    return r.json()


def outfit(client, garments, oid="outfit-1"):
    return client.post("/api/v1/outfits", json={"id":oid,"name":"Test outfit","items":[{"garmentId":g["id"],"role":"top"} for g in garments],"occasion":"casual","season":"all-season","style":"fusion","dateCreated":"2026-10-18T00:00:00Z","isSaved":True})


def test_favorites_wear_feedback_analytics_and_recommendations(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path/"extended.db")
    main.init_db()
    with TestClient(main.app) as c:
        register(c,"Account A","a@x.com")
        top=garment(c,"White Kurta","indian-ethnic","kurta","indian","white")
        bottom=garment(c,"Blue Jeans","bottoms","jeans","western","blue")
        dupatta=garment(c,"Cream Dupatta","indian-ethnic","dupatta","indian","cream")
        saved=outfit(c,[top,bottom])
        assert saved.status_code == 201, saved.text
        oid=saved.json()["id"]
        assert c.put(f"/api/v1/favorites/{oid}").json()["isFavorite"] is True
        assert c.put(f"/api/v1/favorites/{oid}").status_code == 200
        assert len(c.get("/api/v1/favorites").json()) == 1
        assert c.post(f"/api/v1/outfits/{oid}/wear",json={"notes":"test"}).status_code == 201
        assert len(c.get("/api/v1/wear-history").json()) == 1
        assert c.post(f"/api/v1/outfits/{oid}/feedback",json={"feedback":"like"}).status_code == 200
        assert c.get(f"/api/v1/outfits/{oid}/feedback").json()["feedback"] == "like"
        recs=c.post("/api/v1/recommendations",json={"occasion":"casual","season":"all-season","style":"any","limit":10}).json()
        assert recs and any(any(i["garmentId"]==dupatta["id"] for i in rec["items"]) for rec in recs)
        analytics=c.get("/api/v1/analytics/wardrobe").json()
        assert analytics["totalGarments"] == 3
        assert analytics["favourites"] == 1 and analytics["wearEvents"] == 1
        assert len(c.get("/api/v1/analytics/activity").json()["recentWears"]) == 1


def test_extended_endpoints_are_account_scoped(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path/"isolation.db")
    main.init_db()
    with TestClient(main.app) as a, TestClient(main.app) as b:
        register(a,"Account A","a@x.com")
        g=garment(a,"Black Tee","tops","t-shirt","western","black")
        saved=outfit(a,[g])
        oid=saved.json()["id"]
        register(b,"Account B","b@x.com")
        assert b.put(f"/api/v1/favorites/{oid}").status_code == 404
        assert b.post(f"/api/v1/outfits/{oid}/wear",json={}).status_code == 404
        assert b.post(f"/api/v1/outfits/{oid}/feedback",json={"feedback":"like"}).status_code == 404
        assert b.get("/api/v1/analytics/wardrobe").json()["totalGarments"] == 0
