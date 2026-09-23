from sqlalchemy import Column, Integer, String, Float, Text
from app.db.database import Base


class ITICourse(Base):
    __tablename__ = "iti_courses"

    id = Column(Integer, primary_key=True, index=True)
    iti_id = Column(String, index=True)
    iti_name = Column(String)
    district = Column(String, index=True)
    industrial_cluster = Column(String)
    tier = Column(String)
    iti_type = Column(String)
    course_name = Column(String, index=True)
    sector = Column(String, index=True)
    nsqf_level = Column(Integer)
    duration_months = Column(Integer)
    annual_intake_seats = Column(Integer)
    placement_rate_pct = Column(Float)
    skills_taught = Column(Text)
    skills_gap = Column(Text)
    demand_alignment = Column(String)
    mismatch_flag = Column(String, index=True)


class JobDemand(Base):
    __tablename__ = "job_demand"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, unique=True, index=True)
    job_title = Column(String, index=True)
    sector = Column(String, index=True)
    district = Column(String, index=True)
    industrial_cluster = Column(String)
    required_micro_skills = Column(Text)
    nsqf_level = Column(Integer)
    proficiency_level = Column(String)
    experience_required_years = Column(Float)
    min_salary = Column(Integer)
    max_salary = Column(Integer)
    posting_source = Column(String)
    demand_trend = Column(String, index=True)
