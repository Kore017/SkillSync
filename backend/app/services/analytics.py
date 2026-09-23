from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from collections import Counter
from app.models.data_models import ITICourse, JobDemand


def get_dashboard_stats(db: Session):
    total_itis = db.query(func.count(distinct(ITICourse.iti_id))).scalar()
    total_courses = db.query(func.count(ITICourse.id)).scalar()
    total_jobs = db.query(func.count(JobDemand.id)).scalar()
    avg_placement = db.query(func.avg(ITICourse.placement_rate_pct)).scalar() or 0
    total_seats = db.query(func.sum(ITICourse.annual_intake_seats)).scalar() or 0
    districts = db.query(func.count(distinct(ITICourse.district))).scalar()
    undersupply = db.query(func.count(ITICourse.id)).filter(
        ITICourse.mismatch_flag == "UNDERSUPPLY_HIGH_DEMAND"
    ).scalar()
    oversupply = db.query(func.count(ITICourse.id)).filter(
        ITICourse.mismatch_flag.in_(["OVERSUPPLY_LOW_DEMAND", "OVERSUPPLY_LOW_PLACEMENT"])
    ).scalar()
    emerging_jobs = db.query(func.count(JobDemand.id)).filter(
        JobDemand.demand_trend == "Emerging"
    ).scalar()
    return {
        "total_itis": total_itis,
        "total_courses": total_courses,
        "total_jobs": total_jobs,
        "avg_placement_rate": round(avg_placement, 1),
        "total_seats": total_seats,
        "districts_covered": districts,
        "undersupply_courses": undersupply,
        "oversupply_courses": oversupply,
        "emerging_jobs": emerging_jobs,
    }


def get_district_summary(db: Session):
    iti = db.query(
        ITICourse.district,
        func.count(distinct(ITICourse.iti_id)).label("total_itis"),
        func.count(ITICourse.id).label("total_courses"),
        func.sum(ITICourse.annual_intake_seats).label("total_seats"),
        func.avg(ITICourse.placement_rate_pct).label("avg_placement"),
    ).group_by(ITICourse.district).all()

    demand = db.query(
        JobDemand.district,
        func.count(JobDemand.id).label("total_demand"),
    ).group_by(JobDemand.district).all()
    demand_map = {d.district: d.total_demand for d in demand}

    mismatch = db.query(
        ITICourse.district,
        func.count(ITICourse.id).label("mismatch_count"),
    ).filter(
        ITICourse.mismatch_flag.in_(["UNDERSUPPLY_HIGH_DEMAND", "OVERSUPPLY_LOW_DEMAND"])
    ).group_by(ITICourse.district).all()
    mismatch_map = {m.district: m.mismatch_count for m in mismatch}

    result = []
    for row in iti:
        result.append({
            "district": row.district,
            "total_itis": row.total_itis,
            "total_courses": row.total_courses,
            "total_seats": row.total_seats or 0,
            "total_jobs": demand_map.get(row.district, 0),
            "avg_placement_rate": round(row.avg_placement or 0, 1),
            "mismatch_count": mismatch_map.get(row.district, 0),
        })
    return sorted(result, key=lambda x: x["district"])


def get_skill_gap_analysis(db: Session, district: str = None, sector: str = None):
    query = db.query(ITICourse)
    if district:
        query = query.filter(ITICourse.district == district)
    if sector:
        query = query.filter(ITICourse.sector == sector)
    courses = query.all()

    all_taught = []
    all_gaps = []
    for c in courses:
        if c.skills_taught:
            all_taught.extend([s.strip() for s in c.skills_taught.split(";")])
        if c.skills_gap:
            all_gaps.extend([s.strip() for s in c.skills_gap.split(";")])

    return {
        "total_courses_analyzed": len(courses),
        "top_skills_taught": Counter(all_taught).most_common(20),
        "top_skill_gaps": Counter(all_gaps).most_common(20),
    }


def get_demand_supply_mismatch(db: Session, district: str = None):
    query = db.query(ITICourse)
    if district:
        query = query.filter(ITICourse.district == district)
    courses = query.all()

    undersupply = []
    oversupply = []
    balanced = []

    for c in courses:
        flag = c.mismatch_flag or "BALANCED"
        item = {
            "iti_name": c.iti_name,
            "course_name": c.course_name,
            "district": c.district,
            "sector": c.sector,
            "placement_rate": c.placement_rate_pct,
            "seats": c.annual_intake_seats,
            "skills_gap": c.skills_gap,
        }
        if flag == "UNDERSUPPLY_HIGH_DEMAND":
            undersupply.append(item)
        elif flag in ("OVERSUPPLY_LOW_DEMAND", "OVERSUPPLY_LOW_PLACEMENT"):
            oversupply.append(item)
        else:
            balanced.append(item)

    return {
        "undersupply": undersupply,
        "oversupply": oversupply,
        "balanced_count": len(balanced),
        "undersupply_count": len(undersupply),
        "oversupply_count": len(oversupply),
    }


def get_demand_trends(db: Session, district: str = None, sector: str = None):
    query = db.query(JobDemand)
    if district:
        query = query.filter(JobDemand.district == district)
    if sector:
        query = query.filter(JobDemand.sector == sector)
    jobs = query.all()

    by_trend = {}
    for j in jobs:
        trend = j.demand_trend or "Unknown"
        by_trend.setdefault(trend, {"count": 0, "salaries_min": [], "salaries_max": []})
        by_trend[trend]["count"] += 1
        if j.min_salary:
            by_trend[trend]["salaries_min"].append(j.min_salary)
        if j.max_salary:
            by_trend[trend]["salaries_max"].append(j.max_salary)

    trend_result = {}
    for trend, data in by_trend.items():
        trend_result[trend] = {
            "count": data["count"],
            "avg_min_salary": round(sum(data["salaries_min"]) / max(len(data["salaries_min"]), 1)),
            "avg_max_salary": round(sum(data["salaries_max"]) / max(len(data["salaries_max"]), 1)),
        }

    sector_demand = {}
    for j in jobs:
        s = j.sector or "Other"
        sector_demand[s] = sector_demand.get(s, 0) + 1

    return {
        "by_trend": trend_result,
        "by_sector": dict(sorted(sector_demand.items(), key=lambda x: -x[1])),
        "total_jobs": len(jobs),
    }


def get_curriculum_recommendations(db: Session, district: str = None):
    query = db.query(ITICourse).filter(ITICourse.mismatch_flag == "UNDERSUPPLY_HIGH_DEMAND")
    if district:
        query = query.filter(ITICourse.district == district)
    courses = query.all()

    recommendations = []
    for c in courses:
        gap_skills = [s.strip() for s in (c.skills_gap or "").split(";") if s.strip()]
        related_jobs_q = db.query(JobDemand).filter(JobDemand.sector == c.sector)
        if district:
            related_jobs_q = related_jobs_q.filter(JobDemand.district == district)
        related_jobs = related_jobs_q.limit(5).all()

        recommendations.append({
            "course_name": c.course_name,
            "iti_name": c.iti_name,
            "district": c.district,
            "sector": c.sector,
            "current_placement_rate": c.placement_rate_pct,
            "skills_to_add": gap_skills,
            "related_jobs": [
                {"title": j.job_title, "salary_range": f"₹{j.min_salary}-{j.max_salary}"}
                for j in related_jobs
            ],
            "priority": "HIGH" if c.placement_rate_pct and c.placement_rate_pct < 50 else "MEDIUM",
        })
    return sorted(recommendations, key=lambda x: x.get("current_placement_rate") or 100)


def search_jobs_for_trainee(db: Session, skills: str = None, district: str = None, sector: str = None):
    query = db.query(JobDemand)
    if skills:
        for skill in skills.split(","):
            query = query.filter(JobDemand.required_micro_skills.ilike(f"%{skill.strip()}%"))
    if district:
        query = query.filter(JobDemand.district == district)
    if sector:
        query = query.filter(JobDemand.sector.ilike(f"%{sector}%"))
    return query.limit(50).all()


def get_district_training_plan(db: Session, district: str):
    courses = db.query(ITICourse).filter(ITICourse.district == district).all()
    jobs = db.query(JobDemand).filter(JobDemand.district == district).all()

    undersupply = [c for c in courses if c.mismatch_flag == "UNDERSUPPLY_HIGH_DEMAND"]
    oversupply = [c for c in courses if c.mismatch_flag in ("OVERSUPPLY_LOW_DEMAND", "OVERSUPPLY_LOW_PLACEMENT")]
    emerging_jobs = [j for j in jobs if j.demand_trend == "Emerging"]

    all_gaps = []
    for c in undersupply:
        if c.skills_gap:
            all_gaps.extend([s.strip() for s in c.skills_gap.split(";")])

    return {
        "district": district,
        "total_itis": len(set(c.iti_id for c in courses)),
        "total_courses": len(courses),
        "total_job_openings": len(jobs),
        "courses_to_expand": [
            {"course": c.course_name, "iti": c.iti_name, "sector": c.sector, "seats": c.annual_intake_seats}
            for c in undersupply
        ],
        "courses_to_review": [
            {"course": c.course_name, "iti": c.iti_name, "sector": c.sector, "placement_rate_pct": c.placement_rate_pct}
            for c in oversupply
        ],
        "emerging_opportunities": [
            {"title": j.job_title, "sector": j.sector, "salary": f"₹{j.min_salary}-{j.max_salary}"}
            for j in emerging_jobs[:15]
        ],
        "priority_skills_to_develop": Counter(all_gaps).most_common(10),
    }


def analyze_user_profile(db: Session, payload: dict):
    profile_type = payload.get("profile_type", "student").lower()
    sector = payload.get("sector")
    district = payload.get("district")
    qualification = payload.get("qualification", "")
    target_role = payload.get("target_role", "")
    raw_skills = payload.get("current_skills", [])

    if isinstance(raw_skills, str):
        user_skills = [s.strip() for s in raw_skills.replace(",", ";").split(";") if s.strip()]
    else:
        user_skills = [str(s).strip() for s in raw_skills if str(s).strip()]

    user_skills_lower = set(s.lower() for s in user_skills)

    # 1. Fetch relevant job market demands
    job_q = db.query(JobDemand)
    if district:
        job_q = job_q.filter(JobDemand.district == district)
    if sector:
        job_q = job_q.filter(JobDemand.sector == sector)
    jobs = job_q.limit(300).all()

    # 2. Extract market required micro-skills & frequencies
    skill_freq = Counter()
    skill_salaries = {}

    for j in jobs:
        if j.required_micro_skills:
            ms_list = [s.strip() for s in j.required_micro_skills.split(";") if s.strip()]
            for ms in ms_list:
                skill_freq[ms] += 1
                if j.max_salary:
                    skill_salaries.setdefault(ms, []).append(j.max_salary)

    avg_skill_salaries = {
        s: round(sum(sals) / max(len(sals), 1)) for s, sals in skill_salaries.items()
    }

    # 3. Compute possessed skills vs missing skills
    possessed_skills = []
    missing_skills_counter = Counter()

    for m_skill, freq in skill_freq.items():
        if m_skill.lower() in user_skills_lower or any(u in m_skill.lower() for u in user_skills_lower if len(u) > 2):
            possessed_skills.append({
                "skill": m_skill,
                "demand_count": freq,
                "avg_salary": avg_skill_salaries.get(m_skill, 0)
            })
        else:
            missing_skills_counter[m_skill] = freq

    # Top skills user should learn
    recommended_skills = []
    for m_skill, freq in missing_skills_counter.most_common(12):
        recommended_skills.append({
            "skill": m_skill,
            "demand_count": freq,
            "est_salary": avg_skill_salaries.get(m_skill, 18000),
            "priority": "HIGH" if freq >= 3 else "MEDIUM"
        })

    # 4. Calculate Readiness Score (0 - 100%)
    total_market_skills = max(len(skill_freq), 1)
    matched_count = len(possessed_skills)
    base_readiness = min(round((matched_count / min(total_market_skills, 15)) * 100), 95)

    if len(user_skills) == 0:
        readiness_score = 20
    else:
        readiness_score = max(base_readiness, 35 if matched_count > 0 else 25)

    # 5. Build Pros (Strengths)
    pros = []
    if possessed_skills:
        top_p = ", ".join([p["skill"] for p in possessed_skills[:3]])
        pros.append(f"You already possess key industry-valued skills: {top_p}.")
    else:
        pros.append("Strong foundational base to adapt to regional technical roles.")

    if district:
        pros.append(f"Located in {district} which has an active employer base across {len(jobs)} regional job postings.")
    if sector:
        pros.append(f"Targeting sector '{sector}' which is currently expanding in Maharashtra.")
    if qualification:
        pros.append(f"Holds {qualification} qualification offering baseline eligibility for technical certifications.")

    # 6. Build Cons (Gaps & Weaknesses)
    cons = []
    if recommended_skills:
        top_m = ", ".join([m["skill"] for m in recommended_skills[:3]])
        cons.append(f"Missing high-demand micro-skills in your profile: {top_m}.")

    if readiness_score < 60:
        cons.append("Profile match rate is currently below 60% for competitive industry placement.")

    if len(user_skills) < 3:
        cons.append("Limited micro-skill badges documented on profile; add specific technical competencies.")

    cons.append("Lack of updated industry-recognized certification tags for specialized high-paying roles.")

    # 7. Fetch matching ITI / Vocational courses in district
    course_q = db.query(ITICourse)
    if district:
        course_q = course_q.filter(ITICourse.district == district)
    if sector:
        course_q = course_q.filter(ITICourse.sector == sector)
    courses = course_q.limit(6).all()

    recommended_courses = [
        {
            "course_name": c.course_name,
            "iti_name": c.iti_name,
            "district": c.district,
            "placement_rate": c.placement_rate_pct,
            "skills_taught": c.skills_taught,
            "skills_gap": c.skills_gap
        }
        for c in courses
    ]

    # 8. Top matching jobs
    matching_jobs = [
        {
            "job_title": j.job_title,
            "sector": j.sector,
            "district": j.district,
            "salary_range": f"₹{j.min_salary or 15000} - ₹{j.max_salary or 35000}",
            "trend": j.demand_trend or "Stable",
            "required_skills": j.required_micro_skills
        }
        for j in jobs[:6]
    ]

    return {
        "profile_summary": {
            "profile_type": profile_type.capitalize(),
            "sector": sector or "All Sectors",
            "district": district or "All Maharashtra",
            "qualification": qualification or "General",
            "readiness_score": readiness_score,
            "total_user_skills": len(user_skills),
            "matched_industry_skills": len(possessed_skills)
        },
        "pros": pros,
        "cons": cons,
        "possessed_skills": possessed_skills,
        "skills_to_learn": recommended_skills,
        "recommended_courses": recommended_courses,
        "matching_jobs": matching_jobs
    }

