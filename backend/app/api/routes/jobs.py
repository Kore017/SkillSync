from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from typing import Optional
from app.db.database import get_db
from app.models.data_models import JobDemand

router = APIRouter(prefix="/api/jobs", tags=["Job Market"])


@router.get("/")
def list_jobs(
    district: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    trend: Optional[str] = Query(None),
    skills: Optional[str] = Query(None),
    min_salary: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(JobDemand)
    if district:
        query = query.filter(JobDemand.district == district)
    if sector:
        query = query.filter(JobDemand.sector == sector)
    if trend:
        query = query.filter(JobDemand.demand_trend == trend)
    if skills:
        for skill in skills.split(","):
            query = query.filter(JobDemand.required_micro_skills.ilike(f"%{skill.strip()}%"))
    if min_salary:
        query = query.filter(JobDemand.min_salary >= min_salary)
    total = query.count()
    jobs = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": [
            {
                "id": j.id, "job_id": j.job_id, "job_title": j.job_title,
                "sector": j.sector, "district": j.district,
                "industrial_cluster": j.industrial_cluster,
                "required_micro_skills": j.required_micro_skills,
                "nsqf_level": j.nsqf_level, "proficiency_level": j.proficiency_level,
                "experience_required_years": j.experience_required_years,
                "min_salary": j.min_salary, "max_salary": j.max_salary,
                "posting_source": j.posting_source, "demand_trend": j.demand_trend,
            }
            for j in jobs
        ],
    }


@router.get("/sectors")
def job_sectors(db: Session = Depends(get_db)):
    sectors = db.query(distinct(JobDemand.sector)).order_by(JobDemand.sector).all()
    return [s[0] for s in sectors if s[0]]


@router.get("/trends")
def job_trends(db: Session = Depends(get_db)):
    trends = db.query(distinct(JobDemand.demand_trend)).all()
    return [t[0] for t in trends if t[0]]
