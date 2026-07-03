from fastapi import APIRouter
from app.db.mongo import mongo_client
from app.schemas.common import ResponseModel

router = APIRouter()

@router.get("/challenges", response_model=ResponseModel)
def get_all_challenges():
    # Fetch all documents from MongoDB 'challenges' collection
    challenges_col = mongo_client.get_collection("challenges")
    challenges = list(challenges_col.find({}, {"_id": 0}))  # Exclude Mongo ObjectId for easy JSON formatting

    return ResponseModel(
        success=True,
        message=f"Retrieved {len(challenges)} cognitive challenges from MongoDB",
        data=challenges
    )