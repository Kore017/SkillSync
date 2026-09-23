import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base, SessionLocal
from app.api.routes import auth, dashboard, courses, jobs
from app.models.user import User
from app.models.data_models import ITICourse, JobDemand
from app.services.data_loader import load_iti_data, load_job_demand_data

app = FastAPI(
    title="SkillSync",
    description="Labour-market intelligence and curriculum-alignment platform for Maharashtra skill development",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(courses.router)
app.include_router(jobs.router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(ITICourse).count() == 0:
            data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
            iti_path = os.path.join(data_dir, "iti_supply.csv")
            job_path = os.path.join(data_dir, "job_demand.csv")
            if os.path.exists(iti_path):
                load_iti_data(db, iti_path)
            if os.path.exists(job_path):
                load_job_demand_data(db, job_path)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "name": "SkillSync",
        "version": "1.0.0",
        "description": "Skill development alignment platform",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
