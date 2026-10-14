
from getpass import getpass
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from main import get_password_hash

db: Session = SessionLocal()

try:
    for email in ["admin@itscollege.com", "admin@niet.com"]:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"Account not found: {email}")
            continue

        new_password = getpass(f"Enter new password for {email}: ")
        confirm_password = getpass("Confirm password: ")

        if new_password != confirm_password:
            print("Passwords do not match. Skipping account.")
            continue

        user.password = get_password_hash(new_password)
        db.commit()
        print(f"Password updated successfully for {email}")

finally:
    db.close()
