from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.services.analytics import (
    get_dashboard_stats,
    get_district_summary,
    get_skill_gap_analysis,
    get_demand_supply_mismatch,
    get_demand_trends,
    get_curriculum_recommendations,
    get_district_training_plan,
    analyze_user_profile,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard & Analytics"])


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)


@router.get("/districts")
def districts(db: Session = Depends(get_db)):
    return get_district_summary(db)


@router.get("/skill-gap")
def skill_gap(
    district: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_skill_gap_analysis(db, district, sector)


@router.get("/mismatch")
def mismatch(
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_demand_supply_mismatch(db, district)


@router.get("/demand-trends")
def demand_trends(
    district: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_demand_trends(db, district, sector)


@router.get("/curriculum-recommendations")
def curriculum_recs(
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return get_curriculum_recommendations(db, district)


@router.get("/training-plan/{district}")
def training_plan(district: str, db: Session = Depends(get_db)):
    return get_district_training_plan(db, district)


@router.post("/profile-analyzer")
def profile_analyzer(payload: dict, db: Session = Depends(get_db)):
    return analyze_user_profile(db, payload)

