import csv
from sqlalchemy.orm import Session
from app.models.data_models import ITICourse, JobDemand

def clean_val(val):
    val = val.strip() if isinstance(val, str) else val
    if not val or val.lower() in ("nan", "none", "null"):
        return None
    return val

def parse_int(val):
    val = clean_val(val)
    if val is not None:
        try:
            return int(float(val))
        except ValueError:
            return None
    return None

def parse_float(val):
    val = clean_val(val)
    if val is not None:
        try:
            return float(val)
        except ValueError:
            return None
    return None

def load_iti_data(db: Session, filepath: str):
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            course = ITICourse(
                iti_id=clean_val(row.get("iti_id")),
                iti_name=clean_val(row.get("iti_name")),
                district=clean_val(row.get("district")),
                industrial_cluster=clean_val(row.get("industrial_cluster")),
                tier=clean_val(row.get("tier")),
                iti_type=clean_val(row.get("iti_type")),
                course_name=clean_val(row.get("course_name")),
                sector=clean_val(row.get("sector")),
                nsqf_level=parse_int(row.get("nsqf_level")),
                duration_months=parse_int(row.get("duration_months")),
                annual_intake_seats=parse_int(row.get("annual_intake_seats")),
                placement_rate_pct=parse_float(row.get("placement_rate_pct")),
                skills_taught=clean_val(row.get("skills_taught")),
                skills_gap=clean_val(row.get("skills_gap")),
                demand_alignment=clean_val(row.get("demand_alignment")),
                mismatch_flag=clean_val(row.get("mismatch_flag")),
            )
            db.add(course)
    db.commit()


def load_job_demand_data(db: Session, filepath: str):
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            job = JobDemand(
                job_id=clean_val(row.get("job_id")),
                job_title=clean_val(row.get("job_title")),
                sector=clean_val(row.get("sector")),
                district=clean_val(row.get("district")),
                industrial_cluster=clean_val(row.get("industrial_cluster")),
                required_micro_skills=clean_val(row.get("required_micro_skills")),
                nsqf_level=parse_int(row.get("nsqf_level")),
                proficiency_level=clean_val(row.get("proficiency_level")),
                experience_required_years=parse_float(row.get("experience_required_years")),
                min_salary=parse_int(row.get("min_salary")),
                max_salary=parse_int(row.get("max_salary")),
                posting_source=clean_val(row.get("posting_source")),
                demand_trend=clean_val(row.get("demand_trend")),
            )
            db.add(job)
    db.commit()
