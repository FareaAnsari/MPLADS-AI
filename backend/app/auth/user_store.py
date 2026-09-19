"""
Backend User Store with Seeded Baseline Test Users
Supports lookup by username, ID, and refresh token revocation.
"""

from typing import Dict, Optional, List
from schemas.auth_schemas import UserModel, UserRole, ROLE_PERMISSIONS
from auth.security import hash_password

class UserDatabase:
    def __init__(self):
        self.users: Dict[str, UserModel] = {}
        self.revoked_tokens: set[str] = set()
        self._seed_default_users()

    def _seed_default_users(self):
        # 1. District Nodal Inspection Officer
        u1 = UserModel(
            id="usr-officer-001",
            username="officer_araria",
            email="nodal.araria@mplads.gov.in",
            full_name="District Planning Officer (Araria)",
            password_hash=hash_password("GovAdminPass@2026"),
            role=UserRole.DISTRICT_OFFICER,
            permissions=ROLE_PERMISSIONS[UserRole.DISTRICT_OFFICER.value],
            jurisdiction_state="Bihar",
            jurisdiction_district="Araria",
            inspector_id="insp-01",
            is_active=True,
        )
        self.users[u1.username] = u1

        # 2. Member of Parliament Office
        u2 = UserModel(
            id="usr-mp-001",
            username="mp_araria",
            email="mp.office@sansad.nic.in",
            full_name="Hon. MP Constituency Cell (Araria)",
            password_hash=hash_password("SansadPass@2026"),
            role=UserRole.MP_OFFICE,
            permissions=ROLE_PERMISSIONS[UserRole.MP_OFFICE.value],
            jurisdiction_state="Bihar",
            constituency="Araria",
            is_active=True,
        )
        self.users[u2.username] = u2

        # 3. Verified Citizen
        u3 = UserModel(
            id="usr-citizen-001",
            username="citizen_ramesh",
            email="ramesh.kumar@gmail.com",
            full_name="Ramesh Kumar (Panchayat Citizen)",
            password_hash=hash_password("CitizenPass@2026"),
            role=UserRole.CITIZEN,
            permissions=ROLE_PERMISSIONS[UserRole.CITIZEN.value],
            jurisdiction_state="Bihar",
            jurisdiction_district="Araria",
            is_active=True,
        )
        self.users[u3.username] = u3

        # 4. Registered Contractor
        u4 = UserModel(
            id="usr-contractor-001",
            username="contractor_patel",
            email="projects@patelconstructions.in",
            full_name="Patel Infrastructure & Civil Works",
            password_hash=hash_password("ContractorPass@2026"),
            role=UserRole.CONTRACTOR,
            permissions=ROLE_PERMISSIONS[UserRole.CONTRACTOR.value],
            jurisdiction_state="Maharashtra",
            is_active=True,
        )
        self.users[u4.username] = u4

        # 5. Inactive / Disabled Test User
        u5 = UserModel(
            id="usr-disabled-001",
            username="disabled_user",
            email="inactive@example.com",
            full_name="Deactivated Account",
            password_hash=hash_password("Password@123"),
            role=UserRole.CITIZEN,
            permissions=ROLE_PERMISSIONS[UserRole.CITIZEN.value],
            is_active=False,
        )
        self.users[u5.username] = u5

    def get_by_username(self, username: str) -> Optional[UserModel]:
        return self.users.get(username)

    def get_by_id(self, user_id: str) -> Optional[UserModel]:
        return next((u for u in self.users.values() if u.id == user_id), None)

    def revoke_token(self, token: str) -> None:
        self.revoked_tokens.add(token)

    def is_token_revoked(self, token: str) -> bool:
        return token in self.revoked_tokens


user_db = UserDatabase()
