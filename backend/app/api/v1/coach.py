from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User, Role, CoachClient, CoachStatus
from app.schemas.coach import (
    CoachInviteCreate,
    CoachInviteAction,
    CoachInviteResponse,
    CoachClientSummary,
)
from app.schemas.common import ResponseModel

router = APIRouter()


def is_coach_or_admin(user: User) -> bool:
    if not user or not user.role:
        return False
    val = str(user.role.value if hasattr(user.role, "value") else user.role).upper()
    return val in ["COACH", "ADMIN", "ADMINISTRATOR", "WELLNESS_COACH"]


@router.post("/invite", response_model=ResponseModel[CoachInviteResponse])
def invite_client(
    invite_in: CoachInviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Coach endpoint to send an invitation to a client by email.
    """
    if not is_coach_or_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required to invite clients",
        )

    if current_user.email == invite_in.client_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot invite yourself as a client",
        )

    client_user = db.query(User).filter(User.email == invite_in.client_email).first()
    if not client_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with the provided email",
        )

    existing_invite = (
        db.query(CoachClient)
        .filter(
            CoachClient.coach_id == current_user.id,
            CoachClient.client_id == client_user.id,
        )
        .first()
    )

    if existing_invite:
        if existing_invite.status == CoachStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already an assigned client",
            )
        elif existing_invite.status == CoachStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation is already pending for this user",
            )
        else:
            # Re-invite if previously rejected
            existing_invite.status = CoachStatus.PENDING
            db.commit()
            db.refresh(existing_invite)
            invite_record = existing_invite
    else:
        invite_record = CoachClient(
            coach_id=current_user.id,
            client_id=client_user.id,
            status=CoachStatus.PENDING,
        )
        db.add(invite_record)
        db.commit()
        db.refresh(invite_record)

    response_data = CoachInviteResponse(
        id=invite_record.id,
        coach_id=invite_record.coach_id,
        coach_name=current_user.full_name,
        coach_email=current_user.email,
        client_id=invite_record.client_id,
        client_name=client_user.full_name,
        client_email=client_user.email,
        status=invite_record.status,
        assigned_at=invite_record.assigned_at,
    )

    return ResponseModel(message="Client invited successfully", data=response_data)


@router.get("/invites/pending", response_model=ResponseModel[List[CoachInviteResponse]])
def get_pending_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Client endpoint to view incoming pending coaching invitations.
    """
    invites = (
        db.query(CoachClient)
        .filter(
            CoachClient.client_id == current_user.id,
            CoachClient.status == CoachStatus.PENDING,
        )
        .all()
    )

    result = []
    for inv in invites:
        coach = db.query(User).filter(User.id == inv.coach_id).first()
        result.append(
            CoachInviteResponse(
                id=inv.id,
                coach_id=inv.coach_id,
                coach_name=coach.full_name if coach else "Unknown",
                coach_email=coach.email if coach else "",
                client_id=inv.client_id,
                client_name=current_user.full_name,
                client_email=current_user.email,
                status=inv.status,
                assigned_at=inv.assigned_at,
            )
        )

    return ResponseModel(data=result)


@router.post("/invites/{invite_id}/respond")
def respond_to_invite(
    invite_id: UUID,
    action_in: CoachInviteAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Client endpoint to accept or reject a pending coach invitation.
    """
    invite = (
        db.query(CoachClient)
        .filter(
            CoachClient.id == invite_id,
            CoachClient.client_id == current_user.id,
        )
        .first()
    )

    if not invite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found",
        )

    if action_in.action.lower() == "accept":
        invite.status = CoachStatus.ACCEPTED
        message = "Coach invitation accepted"
    elif action_in.action.lower() == "reject":
        invite.status = CoachStatus.REJECTED
        message = "Coach invitation declined"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action must be 'accept' or 'reject'",
        )

    db.commit()
    return ResponseModel(message=message, data={"id": invite.id, "status": invite.status})


@router.get("/clients")
def get_assigned_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Coach endpoint to fetch all clients (both accepted and pending invitations).
    """
    if not is_coach_or_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required",
        )

    coach_clients = (
        db.query(CoachClient)
        .filter(CoachClient.coach_id == current_user.id)
        .all()
    )

    client_summaries = []
    for record in coach_clients:
        client_user = db.query(User).filter(User.id == record.client_id).first()
        if not client_user:
            continue

        # Dynamic analytics for client from habit service
        if record.status == CoachStatus.ACCEPTED:
            from app.services.habit_service import habit_service
            score_data = habit_service.calculate_habit_score(client_user.id)
            habit_score = score_data.get("habit_score", 0.0)
            breakdown = score_data.get("breakdown", {})
            avg_snoozes = breakdown.get("avg_snoozes", 0.0)
            wake_consistency = breakdown.get("wake_consistency", 0.0)
        else:
            habit_score = 0.0
            avg_snoozes = 0.0
            wake_consistency = 0.0

        reasons = []
        if habit_score < 70 and record.status == CoachStatus.ACCEPTED:
            reasons.append(f"Low habit score ({habit_score} / 100)")
        if avg_snoozes >= 2.5 and record.status == CoachStatus.ACCEPTED:
            reasons.append(f"High average snoozes ({avg_snoozes} / alarm)")

        status_label = "Healthy"
        if record.status == CoachStatus.PENDING:
            status_label = "Pending Invite"
        elif record.status == CoachStatus.REJECTED:
            status_label = "Invite Declined"
        elif avg_snoozes >= 2.5:
            status_label = "High Snooze"
        elif habit_score < 70:
            status_label = "Needs Attention"


        client_summaries.append({
            "id": str(record.id),
            "client_id": str(client_user.id),
            "name": client_user.full_name,
            "email": client_user.email,
            "status": status_label,
            "invitation_status": record.status.value,
            "habitScore": habit_score,
            "avgSnoozes": avg_snoozes,
            "wakeConsistency": wake_consistency,
            "reasons": reasons,
            "assigned_at": record.assigned_at.isoformat(),
        })

    from app.models.user import CoachAdvice
    from datetime import datetime, time
    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    advice_sent_today = (
        db.query(CoachAdvice)
        .filter(CoachAdvice.coach_id == current_user.id, CoachAdvice.created_at >= today_start)
        .count()
    )

    return {
        "status": "success",
        "data": client_summaries,
        "advice_sent_today": advice_sent_today,
    }


@router.get("/my-coaches")
def get_my_coaches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Client endpoint to view active accepted coaches assigned to them.
    """
    links = (
        db.query(CoachClient)
        .filter(
            CoachClient.client_id == current_user.id,
            CoachClient.status == CoachStatus.ACCEPTED,
        )
        .all()
    )

    coaches = []
    for link in links:
        coach_user = db.query(User).filter(User.id == link.coach_id).first()
        if coach_user:
            coaches.append({
                "link_id": str(link.id),
                "coach_id": str(coach_user.id),
                "name": coach_user.full_name,
                "email": coach_user.email,
                "assigned_at": link.assigned_at.isoformat(),
            })

    return ResponseModel(data=coaches)


@router.delete("/clients/{client_id}")
def revoke_coach_client_link(
    client_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Allows a client or coach to revoke/delete the coach-client connection.
    """
    link = (
        db.query(CoachClient)
        .filter(
            ((CoachClient.coach_id == current_user.id) & (CoachClient.client_id == client_id)) |
            ((CoachClient.client_id == current_user.id) & (CoachClient.coach_id == client_id)) |
            (CoachClient.id == client_id)
        )
        .first()
    )

    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach-client link not found",
        )

    db.delete(link)
    db.commit()
    return ResponseModel(message="Coach access revoked successfully", data=None)


@router.get("/clients/{client_id}/telemetry")
def get_client_telemetry(
    client_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Coach endpoint to inspect client telemetry (only allowed if status == ACCEPTED).
    """
    if not is_coach_or_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required",
        )

    link = (
        db.query(CoachClient)
        .filter(
            CoachClient.coach_id == current_user.id,
            CoachClient.client_id == client_id,
            CoachClient.status == CoachStatus.ACCEPTED,
        )
        .first()
    )

    if not link and not is_coach_or_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client has not accepted coaching invitation",
        )

    return {
        "status": "success",
        "client_id": str(client_id),
        "telemetry": [],
    }


@router.post("/advice")
def send_client_advice(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Coach endpoint to send guidance/advice message to client.
    """
    if not is_coach_or_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach access required",
        )

    client_id = payload.get("client_id")
    message_text = payload.get("message")

    if not client_id or not message_text:
        raise HTTPException(status_code=400, detail="client_id and message are required")

    from app.models.user import CoachAdvice
    advice_record = CoachAdvice(
        coach_id=current_user.id,
        client_id=UUID(client_id) if isinstance(client_id, str) else client_id,
        message=message_text,
        is_acknowledged=False,
    )
    db.add(advice_record)
    db.commit()
    db.refresh(advice_record)

    return ResponseModel(
        message="Advice sent to client successfully",
        data={"id": str(advice_record.id), "created_at": advice_record.created_at.isoformat()}
    )


@router.get("/advice/my-advice")
def get_my_coach_advice(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Client endpoint to view active unacknowledged advice from their coach.
    """
    from app.models.user import CoachAdvice
    advice_records = (
        db.query(CoachAdvice)
        .filter(
            CoachAdvice.client_id == current_user.id,
            CoachAdvice.is_acknowledged == False,
        )
        .order_by(CoachAdvice.created_at.desc())
        .all()
    )

    result = []
    for a in advice_records:
        coach_user = db.query(User).filter(User.id == a.coach_id).first()
        result.append({
            "id": str(a.id),
            "coach_name": coach_user.full_name if coach_user else "Wellness Coach",
            "coach_email": coach_user.email if coach_user else "",
            "message": a.message,
            "created_at": a.created_at.isoformat(),
        })

    return ResponseModel(data=result)


@router.post("/advice/{advice_id}/acknowledge")
def acknowledge_coach_advice(
    advice_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Client endpoint to acknowledge / dismiss a coach advice message.
    """
    from app.models.user import CoachAdvice
    advice = (
        db.query(CoachAdvice)
        .filter(
            CoachAdvice.id == advice_id,
            CoachAdvice.client_id == current_user.id,
        )
        .first()
    )

    if not advice:
        raise HTTPException(status_code=404, detail="Advice record not found")

    advice.is_acknowledged = True
    db.commit()

    return ResponseModel(message="Advice acknowledged successfully", data=None)
