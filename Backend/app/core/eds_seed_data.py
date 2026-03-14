"""
Seed data for the EDS Standard Points master catalogue.

Categorised into logical groups so that Scrutiny Officers see a clean,
grouped checklist when raising EDS requests.
"""

EDS_STANDARD_POINTS: list[dict] = [
    # ──────────── Fees & Financial ────────────
    {
        "code": "EDS-FIN-001",
        "label": "PP shall submit processing fee details.",
        "category": "Fees & Financial",
    },
    {
        "code": "EDS-FIN-002",
        "label": "PP shall submit LOI.",
        "category": "Fees & Financial",
    },
    {
        "code": "EDS-FIN-003",
        "label": "PP shall submit LOI Extension copy.",
        "category": "Fees & Financial",
    },
    {
        "code": "EDS-FIN-004",
        "label": "PP shall submit lease deed.",
        "category": "Fees & Financial",
    },

    # ──────────── Reports & Studies ────────────
    {
        "code": "EDS-RPT-001",
        "label": "PP shall submit Pre-feasibility report.",
        "category": "Reports & Studies",
    },
    {
        "code": "EDS-RPT-002",
        "label": "PP shall submit PFR.",
        "category": "Reports & Studies",
    },
    {
        "code": "EDS-RPT-003",
        "label": "PP shall submit Certified compliance Report of Air and Water Consent issued by CECB.",
        "category": "Reports & Studies",
    },
    {
        "code": "EDS-RPT-004",
        "label": "PP shall submit DSR (Latest) with Sand Replenishment Study.",
        "category": "Reports & Studies",
    },
    {
        "code": "EDS-RPT-005",
        "label": "PP shall submit Sand Replenishment Study.",
        "category": "Reports & Studies",
    },
    {
        "code": "EDS-RPT-006",
        "label": "PP shall submit DSR (Latest).",
        "category": "Reports & Studies",
    },
    {
        "code": "EDS-RPT-007",
        "label": "PP shall submit updated EIA Report along with updated ToR compliance in Page no. 12, Point 18.",
        "category": "Reports & Studies",
    },
    {
        "code": "EDS-RPT-008",
        "label": "PP shall submit Self compliance Report of previously issued EC.",
        "category": "Reports & Studies",
    },
    {
        "code": "EDS-RPT-009",
        "label": "PP shall submit latest past production certificate certified from Mining Department.",
        "category": "Reports & Studies",
    },

    # ──────────── Mining & Approvals ────────────
    {
        "code": "EDS-MNG-001",
        "label": "PP shall submit Mining plan approval letter.",
        "category": "Mining & Approvals",
    },
    {
        "code": "EDS-MNG-002",
        "label": "PP shall submit approved Mining plan.",
        "category": "Mining & Approvals",
    },
    {
        "code": "EDS-MNG-003",
        "label": "PP shall submit Marked & Delimited Copy.",
        "category": "Mining & Approvals",
    },
    {
        "code": "EDS-MNG-004",
        "label": "PP shall submit Panchnama.",
        "category": "Mining & Approvals",
    },
    {
        "code": "EDS-MNG-005",
        "label": "PP shall submit KML file of applied area with properly demarcated boundary.",
        "category": "Mining & Approvals",
    },
    {
        "code": "EDS-MNG-006",
        "label": "PP shall submit drone video of the applied mining lease area.",
        "category": "Mining & Approvals",
    },
    {
        "code": "EDS-MNG-007",
        "label": "PP shall submit Restoration Plan (if excavated).",
        "category": "Mining & Approvals",
    },

    # ──────────── Land & Ownership ────────────
    {
        "code": "EDS-LND-001",
        "label": "PP shall submit Land Documents.",
        "category": "Land & Ownership",
    },
    {
        "code": "EDS-LND-002",
        "label": "PP shall submit Land Documents & Consent of Land Owners (If applicable).",
        "category": "Land & Ownership",
    },
    {
        "code": "EDS-LND-003",
        "label": "PP shall submit Consent of Land Owners.",
        "category": "Land & Ownership",
    },
    {
        "code": "EDS-LND-004",
        "label": "PP shall submit land documents with khasra No. of applied land and consent of land owners (if applicable).",
        "category": "Land & Ownership",
    },
    {
        "code": "EDS-LND-005",
        "label": "PP shall submit correct and legible copy of land documents containing khasra No. of applied land and consent of land owners (If applicable).",
        "category": "Land & Ownership",
    },

    # ──────────── Forest & Wildlife ────────────
    {
        "code": "EDS-FWL-001",
        "label": "PP shall submit the details of forest land (if any) & shall submit Stage 1 & Stage 2 clearance.",
        "category": "Forest & Wildlife",
    },
    {
        "code": "EDS-FWL-002",
        "label": "PP shall submit revised Forest NOC from DFO, mentioning all khasra no. of applied area & the distance of the lease area from the nearest forest boundary, National Park and Wild Life Sanctuary and Biodiversity Area.",
        "category": "Forest & Wildlife",
    },
    {
        "code": "EDS-FWL-003",
        "label": "PP shall submit Wild life Conservation plan (Schedule 1 Species as per Nt. Dated 01/4/2023).",
        "category": "Forest & Wildlife",
    },
    {
        "code": "EDS-FWL-004",
        "label": "PP shall submit notarized affidavit that no schedule 1 species found.",
        "category": "Forest & Wildlife",
    },
    {
        "code": "EDS-FWL-005",
        "label": "PP shall submit Schedule 1 Species as per Nt. Dated 01/4/2023.",
        "category": "Forest & Wildlife",
    },
    {
        "code": "EDS-FWL-006",
        "label": "PP shall submit the updated list of Scheduled species as per Nt. Dated 01/4/2023 & Wild life Conservation plan (Schedule 1 Species as per Nt. Dated 01/4/2023) - If applicable.",
        "category": "Forest & Wildlife",
    },
    {
        "code": "EDS-FWL-007",
        "label": "PP shall submit NBWL Clearance (if <1km).",
        "category": "Forest & Wildlife",
    },
    {
        "code": "EDS-FWL-008",
        "label": "PP shall submit Wildlife Management Plan.",
        "category": "Forest & Wildlife",
    },

    # ──────────── Certificates & NOCs ────────────
    {
        "code": "EDS-NOC-001",
        "label": "PP shall submit 200 m, 500 m Certificate.",
        "category": "Certificates & NOCs",
    },
    {
        "code": "EDS-NOC-002",
        "label": "PP shall submit Gram Panchayat NoC.",
        "category": "Certificates & NOCs",
    },
    {
        "code": "EDS-NOC-003",
        "label": "PP shall submit Gram Panchayat NoC mentioning Khasra No.",
        "category": "Certificates & NOCs",
    },
    {
        "code": "EDS-NOC-004",
        "label": "PP shall submit Water NOC for Ground water abstraction.",
        "category": "Certificates & NOCs",
    },
    {
        "code": "EDS-NOC-005",
        "label": "PP shall submit Fire NOC.",
        "category": "Certificates & NOCs",
    },
    {
        "code": "EDS-NOC-006",
        "label": "PP shall submit Aviation NOC (If applicable).",
        "category": "Certificates & NOCs",
    },
    {
        "code": "EDS-NOC-007",
        "label": "PP shall submit 500 m Certificate.",
        "category": "Certificates & NOCs",
    },
    {
        "code": "EDS-NOC-008",
        "label": "PP shall submit 200 m Certificate (if applicable).",
        "category": "Certificates & NOCs",
    },

    # ──────────── Environmental Management ────────────
    {
        "code": "EDS-ENV-001",
        "label": "PP shall submit C.E.M.P details for cluster.",
        "category": "Environmental Management",
    },
    {
        "code": "EDS-ENV-002",
        "label": "PP shall submit CEMP details (If applicable).",
        "category": "Environmental Management",
    },
    {
        "code": "EDS-ENV-003",
        "label": "PP shall submit Plantation details as per previously issued EC.",
        "category": "Environmental Management",
    },
    {
        "code": "EDS-ENV-004",
        "label": "PP shall submit EMP Cost Estimates.",
        "category": "Environmental Management",
    },
    {
        "code": "EDS-ENV-005",
        "label": "PP shall submit CER Details with consent from local authority.",
        "category": "Environmental Management",
    },
    {
        "code": "EDS-ENV-006",
        "label": "PP shall submit Solid Waste Management Plan.",
        "category": "Environmental Management",
    },
    {
        "code": "EDS-ENV-007",
        "label": "PP shall submit STP Design & Reuse Plan / Disinfection Proposal.",
        "category": "Environmental Management",
    },
    {
        "code": "EDS-ENV-008",
        "label": "PP shall submit Solar Energy Plan.",
        "category": "Environmental Management",
    },
    {
        "code": "EDS-ENV-009",
        "label": "PP shall submit Green Belt Area statement.",
        "category": "Environmental Management",
    },

    # ──────────── Clearances & Prior EC ────────────
    {
        "code": "EDS-CLR-001",
        "label": "PP shall submit Previously issued EC (Environmental Clearance).",
        "category": "Clearances & Prior EC",
    },

    # ──────────── Construction & Infrastructure ────────────
    {
        "code": "EDS-CON-001",
        "label": "PP shall submit Approved Layout from town and country planning copy.",
        "category": "Construction & Infrastructure",
    },
    {
        "code": "EDS-CON-002",
        "label": "PP shall submit Land Use / Zoning Map.",
        "category": "Construction & Infrastructure",
    },
    {
        "code": "EDS-CON-003",
        "label": "PP shall submit Built-up Area Statement.",
        "category": "Construction & Infrastructure",
    },
    {
        "code": "EDS-CON-004",
        "label": "PP shall submit Building permission copy.",
        "category": "Construction & Infrastructure",
    },

    # ──────────── Presentation & Submission ────────────
    {
        "code": "EDS-SUB-001",
        "label": "PP shall submit Geotagged photographs of applied lease area.",
        "category": "Presentation & Submission",
    },
    {
        "code": "EDS-SUB-002",
        "label": "PP shall submit all notarized affidavits points related to project.",
        "category": "Presentation & Submission",
    },
    {
        "code": "EDS-SUB-003",
        "label": "PP shall submit the details of project (mandatory) mentioned in the below link. Above mentioned link is created for Project Proponents (PPs) to submit the Gist (brief summary) of the applied case for reference and discussion in the upcoming meeting.",
        "category": "Presentation & Submission",
    },
    {
        "code": "EDS-SUB-004",
        "label": "Bring a hardcopy of District Survey Report (DSR - Latest) with Sand Replenishment Study at the time of Presentation.",
        "category": "Presentation & Submission",
    },
    {
        "code": "EDS-SUB-005",
        "label": "Bring a hardcopy of District Survey Report (DSR - Latest) at the time of Presentation.",
        "category": "Presentation & Submission",
    },
]


def get_ordered_points() -> list[dict]:
    """Return points with auto-assigned display_order per category."""
    category_counters: dict[str, int] = {}
    ordered: list[dict] = []
    for point in EDS_STANDARD_POINTS:
        cat = point["category"]
        idx = category_counters.get(cat, 0) + 1
        category_counters[cat] = idx
        ordered.append({**point, "display_order": idx})
    return ordered
