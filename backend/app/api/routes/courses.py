from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import Optional
from app.db.database import get_db
from app.models.data_models import ITICourse, JobDemand

router = APIRouter(prefix="/api/courses", tags=["Courses & ITIs"])


@router.get("/")
def list_courses(
    district: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    mismatch: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(ITICourse)
    if district:
        query = query.filter(ITICourse.district == district)
    if sector:
        query = query.filter(ITICourse.sector == sector)
    if mismatch:
        query = query.filter(ITICourse.mismatch_flag == mismatch)
    if search:
        query = query.filter(ITICourse.course_name.ilike(f"%{search}%"))
    total = query.count()
    courses = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": [
            {
                "id": c.id, "iti_id": c.iti_id, "iti_name": c.iti_name,
                "district": c.district, "tier": c.tier, "iti_type": c.iti_type,
                "course_name": c.course_name, "sector": c.sector,
                "nsqf_level": c.nsqf_level, "duration_months": c.duration_months,
                "annual_intake_seats": c.annual_intake_seats,
                "placement_rate_pct": c.placement_rate_pct,
                "skills_taught": c.skills_taught, "skills_gap": c.skills_gap,
                "demand_alignment": c.demand_alignment, "mismatch_flag": c.mismatch_flag,
            }
            for c in courses
        ],
    }


@router.get("/sectors")
def list_sectors(db: Session = Depends(get_db)):
    sectors = db.query(distinct(ITICourse.sector)).order_by(ITICourse.sector).all()
    return [s[0] for s in sectors if s[0]]


@router.get("/districts")
def list_districts(db: Session = Depends(get_db)):
    districts = db.query(distinct(ITICourse.district)).order_by(ITICourse.district).all()
    return [d[0] for d in districts if d[0]]


@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(ITICourse).filter(ITICourse.id == course_id).first()
    if not course:
        return {"error": "Course not found"}
    related_jobs = db.query(JobDemand).filter(
        JobDemand.sector == course.sector,
        JobDemand.district == course.district,
    ).limit(10).all()
    return {
        "course": {
            "id": course.id, "iti_id": course.iti_id, "iti_name": course.iti_name,
            "district": course.district, "course_name": course.course_name,
            "sector": course.sector, "nsqf_level": course.nsqf_level,
            "duration_months": course.duration_months,
            "annual_intake_seats": course.annual_intake_seats,
            "placement_rate_pct": course.placement_rate_pct,
            "skills_taught": course.skills_taught, "skills_gap": course.skills_gap,
            "demand_alignment": course.demand_alignment, "mismatch_flag": course.mismatch_flag,
        },
        "related_jobs": [
            {"job_title": j.job_title, "sector": j.sector,
             "min_salary": j.min_salary, "max_salary": j.max_salary,
             "required_skills": j.required_micro_skills, "demand_trend": j.demand_trend}
            for j in related_jobs
        ],
    }
